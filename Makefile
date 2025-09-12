NPM ?= "$(shell command -v bun 2>/dev/null || command -v pnpm 2>/dev/null || command -v npm 2>/dev/null || command -v yarn 2>/dev/null)"
TAURI ?= "$(shell command -v cargo-tauri 2>/dev/null)"
TAURI ?= $(NPM) tauri

.PHONY: all build-site deploy dev-site dev-app build-linux-app clean build-windows-app-from-linux bump-patch-version bump-minor-version build-windows-app build-from-source

define version
$(shell sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' src-tauri/tauri.conf.json)
endef

# Generate icons
icon:
	@$(TAURI) icon src/assets/images/favicon.png &> cache/build.log

# Runs the website in develop mode
dev-site:
	$(NPM) run dev --open

# Runs the app in develop mode
dev-app:
	$(TAURI) dev

# Builds the website for production
build-site:
	@clear
	@mkdir -p cache
	@echo "" > cache/build.log
	@[ -d build/web ] && rm build/web -rf
	@mkdir -p build
	@echo ""
	@echo -e "\e[1;33mwallflower.land\e[0m version \e[1;36m$(call version)\e[0m"
	@echo ""
	@echo -e "\e[1;32mBuilding\e[0m website..."
	@echo -en "    \e[1;32mCompiling\e[0m Svelte project... "
	@if $(NPM) run build &>cache/build.log ; then echo -e "\e[1;32mDone!\e[0m" ; else echo -e "\e[1;31mError:\e[0m\n\n$$(<cache/build.log)\n\n\e[1;31mError:\e[0m Aborting due to the error above."; exit 1; fi
	@echo -en "    \e[1;32mAdding\e[0m extra necessary files... "
	@touch build/web/.nojekyll
	@touch build/web/CNAME
	@echo "wallflower.land" >> build/web/CNAME
	@echo -e "\e[1;32mDone!\e[0m"
	@echo -e "\e[1;32mDone!\e[0m Website written to \e[1;36m/build/web\e[0m"
	@echo ""

# Build a Windows EXE from linux
build-windows-app-from-linux: icon
	@mkdir -p cache
	@echo "" > cache/build.log
	@echo ""
	@echo -e "\e[1;33mwallflower.land\e[0m version \e[1;36m$(call version)\e[0m"
	@echo ""
	@echo -e "\e[1;32mBuilding\e[0m Windows app from Linux..."
	@rustup target add x86_64-pc-windows-msvc &> cache/build.log
	@cargo install --locked cargo-xwin &> cache/build.log
	@echo -en "    \e[1;32mGenerating\e[0m app icons... "
	@$(MAKE) --no-print-directory icon
	@echo -e "\e[1;32mDone!\e[0m"
	@echo -en "    \e[1;32mCompiling\e[0m Tauri project... "
	@$(TAURI) build --runner cargo-xwin --target x86_64-pc-windows-msvc
	@echo -e "\e[1;32mDone!\e[0m Windows app written to \e[1;36m/build/$(call version)/windows\e[0m"
	@echo ""

# Universal build from source
build-from-source:
	@mkdir -p cache
	@echo "" > cache/build.log
	@clear
	@echo ""
	@echo -e "\e[1;33mwallflower.land\e[0m version \e[1;36m$(call version)\e[0m"
	@echo ""
	@echo -e "\e[1;32mBuilding\e[0m native app from source..."
	@echo -en "    \e[1;32mGenerating\e[0m app icons... "
	@$(MAKE) --no-print-directory icon
	@echo -e "\e[1;32mDone!\e[0m"
	@echo -en "    \e[1;32mCompiling\e[0m Tauri project... "
	@if NO_STRIP=true $(TAURI) build --verbose &>cache/build.log ; then echo -e "\e[1;32mDone!\e[0m" ; else echo -e "\e[1;31mError:\e[0m\n\n$$(<cache/build.log)\n\n\e[1;31mError:\e[0m Aborting due to the error above."; exit 1; fi
	@echo -en "    \e[1;32mMoving\e[0m files... "
	@mkdir -p build/$(call version)
	@[ -d build/$(call version)/source ] && rm build/$(call version)/source -rf
	@[ -d src-tauri/target/release/bundle/deb ] && cp -r src-tauri/target/release/bundle/deb build/$(call version)/source
	@echo -e "\e[1;32mDone!\e[0m"
	@echo -e "\e[1;32mDone!\e[0m Native app written to \e[1;36m/build/$(call version)/source\e[0m"
	@echo ""

# Builds the app for production as a native executable for the current system
build-debian-app:
	@clear
	@mkdir -p cache
	@echo "" > cache/build.log
	@echo ""
	@echo -e "\e[1;33mwallflower.land\e[0m version \e[1;36m$(call version)\e[0m"
	@echo ""
	@echo -e "\e[1;32mBuilding\e[0m Debian app..."
	@echo -en "    \e[1;32mGenerating\e[0m app icons... "
	@$(MAKE) --no-print-directory icon
	@echo -e "\e[1;32mDone!\e[0m"
	@echo -en "    \e[1;32mCompiling\e[0m Tauri project... "
	@if NO_STRIP=true $(TAURI) build --verbose &>cache/build.log ; then echo -e "\e[1;32mDone!\e[0m" ; else echo -e "\e[1;31mError:\e[0m\n\n$$(<cache/build.log)\n\n\e[1;31mError:\e[0m Aborting due to the error above."; exit 1; fi
	@echo -en "    \e[1;32mMoving\e[0m files... "
	@mkdir -p build/$(call version)/linux
	@[ -d build/$(call version)/linux/debian ] && rm build/$(call version)/debian -rf
	@[ -d src-tauri/target/release/bundle/deb ] && cp -r src-tauri/target/release/bundle/deb build/$(call version)/linux/debian
	@echo -e "\e[1;32mDone!\e[0m"
	@echo -e "\e[1;32mDone!\e[0m Debian app written to \e[1;36m/build/$(call version)/linux/debian\e[0m"
	@echo ""

# Clean everything
clean:
	rm node_modules -rf
	rm build -rf
	rm src-tauri/target -rf
	$(NPM) install

# Build a native windows app
build-windows-app:
	@clear
	@mkdir -p cache
	@echo "" > cache/build.log
	@echo ""
	@echo -e "\e[1;33mwallflower.land\e[0m version \e[1;36m$(call version)\e[0m"
	@echo ""
	@echo -e "\e[1;32mBuilding\e[0m Windows app..."
	@echo -en "    \e[1;32mGenerating\e[0m app icons... "
	@$(MAKE) --no-print-directory icon
	@echo -e "\e[1;32mDone!\e[0m"
	@echo -en "    \e[1;32mCompiling\e[0m Tauri project... "
	@if $(TAURI) build --verbose &>cache/build.log ; then echo -e "\e[1;32mDone!\e[0m" ; else echo -e "\e[1;31mError:\e[0m\n\n$$(<cache/build.log)\n\n\e[1;31mError:\e[0m Aborting due to the error above."; exit 1; fi
	@echo -en "    \e[1;32mMoving\e[0m files... "
	@mkdir -p build/$(call version)
	@[ -d build/$(call version)/windows ] && rm build/$(call version)/windows -rf
	@mkdir -p build/$(call version)/windows
	@[ -d src-tauri/target/release/bundle/nsis ] && cp -r src-tauri/target/release/bundle/nsis/* build/windows/$(call version)
	@[ -d src-tauri/target/release/bundle/msi ] && cp -r src-tauri/target/release/bundle/msi/* build/windows/$(call version)
	@echo -e "\e[1;32mDone!\e[0m"
	@echo -e "\e[1;32mDone!\e[0m Windows app written to \e[1;36m/build/$(call version)/windows\e[0m"
	@echo ""

# Increment patch version
bump-patch-version:
	sed -i -E 's/"version": *"([0-9]+)\.([0-9]+)\.([0-9]+)"/"version": "\1.\2.\3 + 1"/e' src/tauri.conf.json
	sed -i -E 's/"version": *"([0-9]+)\.([0-9]+)\.([0-9]+)"/"version": "\1.\2.\3 + 1"/e' package.json
	sed -i -E 's/^version = "([0-9]+)\.([0-9]+)\.([0-9]+)"/version = "\1.\2.$((\3+1))"/e' Cargo.toml

# Increment minor version
bump-minor-version:
	sed -i -E 's/"version": *"([0-9]+)\.([0-9]+)\.[0-9]+"/"version": "\1.$((\2+1)).0"/e' src/tauri.conf.json
	sed -i -E 's/"version": *"([0-9]+)\.([0-9]+)\.[0-9]+"/"version": "\1.$((\2+1)).0"/e' package.conf.json
	sed -i -E 's/^version = "([0-9]+)\.([0-9]+)\.[0-9]+"/version = "\1.$((\2+1)).0"/e' Cargo.toml

# Builds the website for production and deploys it publicly
deploy-site:
	@clear
	@mkdir -p cache
	@echo "" > cache/build.log
	@[ -d build/web ] && rm build/web -rf
	@mkdir -p build
	@echo ""
	@echo -e "\e[1;33mwallflower.land\e[0m version \e[1;36m$(call version)\e[0m"
	@echo ""
	@echo -e "\e[1;32mDeploying\e[0m website..."
	@echo -e "    \e[1;32mBuilding\e[0m website..."
	@echo -en "        \e[1;32mCompiling\e[0m Svelte project... "
	@if $(NPM) run build &>cache/build.log ; then echo -e "\e[1;32mDone!\e[0m" ; else echo -e "\e[1;31mError:\e[0m\n\n$$(<cache/build.log)\n\n\e[1;31mError:\e[0m Aborting due to the error above."; exit 1; fi
	@echo -en "        \e[1;32mAdding\e[0m extra necessary files... "
	@touch build/web/.nojekyll
	@touch build/web/CNAME
	@echo "wallflower.land" >> build/web/CNAME
	@echo -e "\e[1;32mDone!\e[0m"
	@echo -e "    \e[1;32mDone!\e[0m Website written to \e[1;36m/build/web\e[0m"
	@echo -en "    \e[1;32mDeploying\e[0m to GitHub..."
	@git add . &>cache/build.log
	@git commit -m "New build deployment" &>cache/build.log
	@git push --no-progress &>cache/build.log
	@git push origin `git subtree split --prefix build/web main`:gh-pages --force --no-progress &>cache/build.log
	@echo -e "\e[1;32mDone!\e[0m"
	@echo -e "\e[1;32mDone!\e[0m Website deployed to GitHub pages."
	@echo ""
