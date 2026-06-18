use typst::diag::{FileError, FileResult, SourceDiagnostic};
use typst::foundations::{Bytes, Datetime, Duration};
use typst::syntax::{FileId, RootedPath, Source, VirtualPath, VirtualRoot};
use typst::text::{Font, FontBook};
use typst::utils::LazyHash;
use typst::{Feature, Features, Library, LibraryExt, World};
use typst_html::{HtmlDocument, HtmlOptions};
use wasm_bindgen::prelude::*;

/// Compile a self-contained Typst source string to an embeddable HTML fragment.
///
/// This world intentionally has no filesystem: imports, external images, and
/// packages are the caller's responsibility. Bundled fonts are available so
/// Typst can render constructs that fall back to frames.
pub fn render_html(input: &str) -> Result<String, String> {
    let world = InMemoryWorld::new(input);
    let compiled = typst::compile::<HtmlDocument>(&world);
    let document = compiled.output.map_err(format_diagnostics)?;

    let document =
        typst_html::html(&document, &HtmlOptions::default()).map_err(format_diagnostics)?;

    body_fragment(document)
}

#[wasm_bindgen(js_name = typstToHtml)]
pub fn typst_to_html(input: &str) -> Result<String, JsError> {
    render_html(input).map_err(|message| JsError::new(&message))
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
    use super::render_html;

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
}
use std::sync::OnceLock;
