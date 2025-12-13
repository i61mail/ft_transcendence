.PHONY: front back dev help remote setup build

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
	npm run dev --prefix front & \
	npm run dev --prefix back

remote: # maybe this doesnt do anything lol
	@echo "Starting dev servers accessible remotely on 0.0.0.0..."
	npm run dev --prefix front -- --hostname 0.0.0.0 & \
	npm run dev --prefix back -- --hostname 0.0.0.0

help:
	@echo "Usage:"
	@echo "  make front      # run npm run dev in ./front"
	@echo "  make back       # run npm run dev in ./back"
	@echo "  make dev        # run front in background, back in foreground (default)"
	@echo "  make remote     # run dev servers accessible remotely"


build:
	npm run build --prefix front
	npm run build --prefix back

start:
	npm run start --prefix back & npm run start --prefix front