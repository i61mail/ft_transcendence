# Makefile to run npm run dev in client and server directories

.PHONY: client server dev help

.DEFAULT_GOAL := dev

client:
	cd client && npm run dev

server:
	cd server && npm run dev

dev:
	@echo "Starting client in background and server in foreground..."
	npm run dev --prefix client& \
	npm run dev --prefix server

help:
	@echo "Usage:"
	@echo "  make client   # run npm run dev in ./client"
	@echo "  make server   # run npm run dev in ./server"
	@echo "  make dev      # run client in background, server in foreground (default)"
