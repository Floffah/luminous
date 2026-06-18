set shell := ["nu", "-c"]

mod wiki

[parallel]
dev: wiki::dev

build: wiki::build

preview: wiki::preview