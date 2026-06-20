set shell := ["nu", "-c"]

mod site
mod docs

[parallel]
dev: site::dev

build: docs::build site::build

preview: site::preview

test: site::test