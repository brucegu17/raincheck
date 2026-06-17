.PHONY: test build build-mac build-windows dist clean copy-dist

GO    ?= go
OUT   ?= bin
NAME  ?= raincheck-server

test:
	$(GO) test ./...

copy-dist:
	@if [ ! -d ../dist ]; then echo "请在仓库根目录先运行 npm run build"; exit 1; fi
	rm -rf dist
	mkdir -p dist
	cp -R ../dist/. dist/

build-mac: copy-dist
	mkdir -p $(OUT)
	$(GO) build -trimpath -ldflags "-s -w" -o $(OUT)/$(NAME) .

build-windows: copy-dist
	mkdir -p $(OUT)
	GOOS=windows GOARCH=amd64 $(GO) build -trimpath -ldflags "-s -w" -o $(OUT)/$(NAME).exe .

dist: build-windows

clean:
	rm -rf $(OUT) dist
