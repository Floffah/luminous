use serde::Serialize;
use typst::diag::{FileError, FileResult, SourceDiagnostic};
use typst::foundations::{Bytes, Datetime, Duration, Label, Selector, Value};
use typst::introspection::{Introspector, MetadataElem};
use typst::syntax::{FileId, RootedPath, Source, VirtualPath, VirtualRoot};
use typst::text::{Font, FontBook};
use typst::utils::{LazyHash, PicoStr};
use typst::{Feature, Features, Library, LibraryExt, World};
use typst_html::{HtmlDocument, HtmlOptions};
use wasm_bindgen::prelude::*;

const ASTRO_METADATA_LABEL: &str = "astro-content-metadata";
const ASTRO_METADATA_DEFAULT: &str = "#let astro = (:)\n";
const ASTRO_METADATA_PROBE: &str = r#"
#metadata(json.encode(astro)) <astro-content-metadata>
"#;

#[derive(Debug, PartialEq, Serialize)]
pub struct CompiledTypst {
    pub html: String,
    pub metadata: serde_json::Value,
}

/// Compile a self-contained Typst source string to an embeddable HTML fragment.
///
/// This world intentionally has no filesystem: imports, external images, and
/// packages are the caller's responsibility. Bundled fonts are available so
/// Typst can render constructs that fall back to frames.
pub fn render_html(input: &str) -> Result<String, String> {
    let world = InMemoryWorld::new(input);
    let document = compile_document(&world)?;

    render_document(&document)
}

/// Compile Typst and extract the metadata Astro needs for a content entry.
///
/// The source may define an `astro` variable containing any JSON-compatible
/// value. It defaults to an empty dictionary. Astro's collection schema is
/// responsible for validating the resulting metadata.
pub fn compile_content(input: &str) -> Result<CompiledTypst, String> {
    let source = format!("{ASTRO_METADATA_DEFAULT}{input}\n{ASTRO_METADATA_PROBE}");
    let world = InMemoryWorld::new(&source);
    let document = compile_document(&world)?;
    let metadata = extract_metadata(&document)?;
    let html = render_document(&document)?;

    Ok(CompiledTypst { html, metadata })
}

fn compile_document(world: &InMemoryWorld) -> Result<HtmlDocument, String> {
    typst::compile::<HtmlDocument>(world)
        .output
        .map_err(format_diagnostics)
}

fn render_document(document: &HtmlDocument) -> Result<String, String> {
    let html = typst_html::html(document, &HtmlOptions::default()).map_err(format_diagnostics)?;

    body_fragment(html)
}

fn extract_metadata(document: &HtmlDocument) -> Result<serde_json::Value, String> {
    let label = Label::new(PicoStr::intern(ASTRO_METADATA_LABEL))
        .expect("the Astro metadata label is not empty");
    let mut matches = document
        .introspector()
        .query(&Selector::Label(label))
        .into_iter();
    let content = matches
        .next()
        .ok_or_else(|| "Typst did not emit Astro content metadata".to_owned())?;

    if matches.next().is_some() {
        return Err("Typst emitted more than one Astro content metadata value".to_owned());
    }

    let metadata = content
        .unpack::<MetadataElem>()
        .map_err(|_| "Astro content metadata had an unexpected Typst element".to_owned())?;
    let json = match metadata.value {
        Value::Str(value) => value.to_string(),
        _ => return Err("Astro content metadata was not encoded as JSON".to_owned()),
    };

    serde_json::from_str(&json).map_err(|error| format!("invalid Astro content metadata: {error}"))
}

#[wasm_bindgen(js_name = typstToHtml)]
pub fn typst_to_html(input: &str) -> Result<String, JsError> {
    render_html(input).map_err(|message| JsError::new(&message))
}

/// Compile a Typst content entry and return `{ html, metadata }` as JSON.
#[wasm_bindgen(js_name = typstToHtmlWithMetadata)]
pub fn typst_to_html_with_metadata(input: &str) -> Result<String, JsError> {
    let compiled = compile_content(input).map_err(|message| JsError::new(&message))?;
    serde_json::to_string(&compiled).map_err(|error| JsError::new(&error.to_string()))
}

struct InMemoryWorld {
    main: FileId,
    source: Source,
}

struct CompilerState {
    library: LazyHash<Library>,
    book: LazyHash<FontBook>,
    fonts: Vec<Font>,
}

static COMPILER_STATE: OnceLock<CompilerState> = OnceLock::new();

fn compiler_state() -> &'static CompilerState {
    COMPILER_STATE.get_or_init(|| {
        let fonts: Vec<_> = typst_assets::fonts()
            .flat_map(|data| Font::iter(Bytes::new(data)))
            .collect();
        let book = FontBook::from_fonts(fonts.iter());
        let features: Features = std::iter::once(Feature::Html).collect();
        let library = Library::builder().with_features(features).build();

        CompilerState {
            library: LazyHash::new(library),
            book: LazyHash::new(book),
            fonts,
        }
    })
}

impl InMemoryWorld {
    fn new(input: &str) -> Self {
        let main = FileId::new(RootedPath::new(
            VirtualRoot::Project,
            VirtualPath::new("/main.typ").expect("the virtual main path is valid"),
        ));
        Self {
            main,
            source: Source::new(main, input.to_owned()),
        }
    }
}

impl World for InMemoryWorld {
    fn library(&self) -> &LazyHash<Library> {
        &compiler_state().library
    }

    fn book(&self) -> &LazyHash<FontBook> {
        &compiler_state().book
    }

    fn main(&self) -> FileId {
        self.main
    }

    fn source(&self, id: FileId) -> FileResult<Source> {
        if id == self.main {
            Ok(self.source.clone())
        } else {
            Err(unavailable_file())
        }
    }

    fn file(&self, id: FileId) -> FileResult<Bytes> {
        if id == self.main {
            Ok(Bytes::from_string(self.source.text().to_owned()))
        } else {
            Err(unavailable_file())
        }
    }

    fn font(&self, index: usize) -> Option<Font> {
        compiler_state().fonts.get(index).cloned()
    }

    fn today(&self, _offset: Option<Duration>) -> Option<Datetime> {
        None
    }
}

fn unavailable_file() -> FileError {
    FileError::Other(Some(
        "external files are not available to typst-wasm".into(),
    ))
}

fn format_diagnostics(diagnostics: impl IntoIterator<Item = SourceDiagnostic>) -> String {
    diagnostics
        .into_iter()
        .map(|diagnostic| diagnostic.message.to_string())
        .collect::<Vec<_>>()
        .join("\n")
}

fn body_fragment(document: String) -> Result<String, String> {
    let body_start = document
        .find("<body")
        .and_then(|start| document[start..].find('>').map(|end| start + end + 1))
        .ok_or_else(|| "Typst's HTML output did not contain a body element".to_owned())?;
    let body_end = document
        .rfind("</body>")
        .ok_or_else(|| "Typst's HTML output did not close its body element".to_owned())?;

    if body_start > body_end {
        return Err("Typst's HTML output contained an invalid body element".to_owned());
    }

    Ok(document[body_start..body_end].to_owned())
}

#[allow(dead_code)]
pub fn set_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[cfg(test)]
mod tests {
    use super::{compile_content, render_html};

    #[test]
    fn renders_typst_as_html() {
        let html = render_html("= Hello\n\nThis is *Typst*.").unwrap();

        assert!(!html.contains("<!DOCTYPE html>"));
        assert!(!html.contains("<body"));
        assert!(html.contains("<h2"), "{}", html);
        assert!(html.contains("Hello"), "{}", html);
        assert!(html.contains("<strong>Typst</strong>"), "{}", html);
    }

    #[test]
    fn reports_typst_errors() {
        let error = render_html("#let broken =").unwrap_err();

        assert!(!error.is_empty());
    }

    #[test]
    fn compiles_html_and_extracts_content_metadata() {
        let compiled = compile_content(
            r#"#let astro = (
  title: "A luminous page",
  tags: ("typst", "astro"),
  type: "guide",
  description: "Compile once, use twice.",
  nested: (draft: false, priority: 2),
)

= Hello"#,
        )
        .unwrap();

        assert!(compiled.html.contains("Hello"), "{}", compiled.html);
        assert_eq!(compiled.metadata["title"], "A luminous page");
        assert_eq!(compiled.metadata["tags"][1], "astro");
        assert_eq!(compiled.metadata["type"], "guide");
        assert_eq!(compiled.metadata["description"], "Compile once, use twice.");
        assert_eq!(compiled.metadata["nested"]["draft"], false);
        assert_eq!(compiled.metadata["nested"]["priority"], 2);
    }

    #[test]
    fn defaults_content_metadata_to_an_empty_object() {
        let compiled = compile_content("= No metadata").unwrap();

        assert_eq!(compiled.metadata, serde_json::json!({}));
    }
}
use std::sync::OnceLock;
