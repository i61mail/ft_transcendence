# Makefile to run npm run dev in front and back directories

.PHONY: front back dev help

.DEFAULT_GOAL := dev

front:
	cd front && npm run dev

back:
	cd back && npm run dev

setup:
	npm install --prefix front
	npm install --prefix back

dev:
	@echo "Starting front in background and back in foreground..."
	npm run dev --prefix front& \
	npm run dev --prefix back

help:
	@echo "Usage:"
	@echo "  make front   # run npm run dev in ./front"
	@echo "  make back   # run npm run dev in ./back"
	@echo "  make dev      # run front in background, back in foreground (default)"
