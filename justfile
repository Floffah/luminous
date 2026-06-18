set shell := ["nu", "-c"]

mod site

[parallel]
dev: site::dev

build: site::build

preview: site::preview