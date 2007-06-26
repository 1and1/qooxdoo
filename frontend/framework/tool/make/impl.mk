################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1and1.org
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Andreas Ecker (ecker)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

################################################################################
# EXEC TARGETS
################################################################################

#
# Cleanup targets
#

exec-clean:
	@echo "  * Cleaning up build..."
	@$(CMD_REMOVE) $(APPLICATION_BUILD_PATH)/script/$(APPLICATION_SCRIPT_FILENAME)
	@$(CMD_REMOVE) $(APPLICATION_BUILD_PATH)/script/$(APPLICATION_SCRIPT_FILENAME:.js=)_*.js

	@echo "  * Cleaning up source..."
	@$(CMD_REMOVE) $(APPLICATION_SOURCE_PATH)/script/$(APPLICATION_SCRIPT_FILENAME)
	@$(CMD_REMOVE) $(APPLICATION_SOURCE_PATH)/translation/messages.pot

	@echo "  * Cleaning up framework..."
	@$(CMD_REMOVE) $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot

exec-distclean:
	@echo "  * Deleting build..."
	@$(CMD_REMOVE) $(APPLICATION_BUILD_PATH)

	@echo "  * Deleting api..."
	@$(CMD_REMOVE) $(APPLICATION_API_PATH)

	@echo "  * Deleting debug..."
	@$(CMD_REMOVE) $(APPLICATION_DEBUG_PATH)

	@echo "  * Cleaning up source..."
	@$(CMD_REMOVE) $(APPLICATION_SOURCE_PATH)/script
	@$(CMD_REMOVE) $(APPLICATION_SOURCE_PATH)/translation/messages.pot
	@$(CMD_REMOVE) $(APPLICATION_SOURCE_PATH)/class/$(APPLICATION_NAMESPACE_PATH)/translation
	@$(CMD_FIND) $(APPLICATION_SOURCE_PATH) $(FILES_TEMP) -exec $(CMD_REMOVE) {} \;

	@echo "  * Cleaning up framework..."
	@$(CMD_REMOVE) $(FRAMEWORK_CACHE_PATH)
	@$(CMD_REMOVE) $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot
	@$(CMD_REMOVE) $(FRAMEWORK_SOURCE_PATH)/class/$(FRAMEWORK_NAMESPACE_PATH)/locale/data
	@$(CMD_REMOVE) $(FRAMEWORK_SOURCE_PATH)/class/$(FRAMEWORK_NAMESPACE_PATH)/locale/translation
	@$(CMD_REMOVE) $(FRAMEWORK_CACHE_PATH)
	@$(CMD_REMOVE) $(QOOXDOO_INCLUDE_CACHE)




#
# Generator targets
#

exec-script-source:
	
	$(SILENCE) $(CMD_GENERATOR) \
	  $(COMPUTED_CLASS_PATH) \
	  $(COMPUTED_CLASS_URI) \
	  $(COMPUTED_SOURCE_SETTING) \
	  $(COMPUTED_SOURCE_VARIANT) \
	  $(COMPUTED_SOURCE_INCLUDE) \
	  $(COMPUTED_SOURCE_OPTIONS) \
	  $(COMPUTED_TEMPLATE) \
	  --generate-source-script \
	  --source-script-file $(COMPUTED_SOURCE_SCRIPT_NAME)
	

exec-script-build:
    # expand Makefile variables in the arguments
	$(eval ARGS = \
	  $(COMPUTED_CLASS_PATH) \
	  $(COMPUTED_BUILD_RESOURCE) \
	  $(COMPUTED_BUILD_SETTING) \
	  $(COMPUTED_BUILD_VARIANT) \
	  $(COMPUTED_BUILD_INCLUDE) \
	  $(COMPUTED_BUILD_OPTIONS) \
	  --generate-compiled-script \
	  --compiled-script-file $(COMPUTED_BUILD_SCRIPT_NAME) \
	  $(APPLICATION_ADDITIONAL_SCRIPT_BUILD_OPTIONS) \
	) 
	
	$(SILENCE) $(CMD_GENERATOR) $(ARGS)

exec-script-build-split:
	# generate base profile
	$(SILENCE) $(CMD_GENERATOR) \
	  $(COMPUTED_CLASS_PATH) \
      $(COMPUTED_CLASS_URI) \
	  $(COMPUTED_BUILD_RESOURCE) \
	  $(COMPUTED_BUILD_SETTING) \
	  $(COMPUTED_BUILD_VARIANT) \
	  $(COMPUTED_BUILD_INCLUDE) \
	  $(COMPUTED_BUILD_OPTIONS) \
	  --package-id qx \
	  $(APPLICATION_ADDITIONAL_SCRIPT_BUILD_OPTIONS) \
	  --export-to-file _qx.dat

	# generate include file list
	$(SILENCE) $(CMD_GENERATOR) \
	  $(COMPUTED_CLASS_PATH) \
	  $(COMPUTED_BUILD_INCLUDE) \
	  --package-id qx \
	  $(APPLICATION_ADDITIONAL_SCRIPT_BUILD_OPTIONS) \
	  --print-includes-file includes.dat

  # combine base profile and include list
	@$(CMD_PYTHON) $(FRAMEWORK_TOOL_PATH)/modules/create-profile.py _qx.dat includes.dat > qx.dat
	@rm _qx.dat includes.dat
	@$(CMD_DIR) build/script
	@mv qx.dat build/script

	# generate qx.js
	$(SILENCE) $(CMD_GENERATOR) --from-file build/script/qx.dat

  # generate application.js
	$(SILENCE) $(CMD_GENERATOR) \
	  $(COMPUTED_CLASS_PATH) \
	  $(COMPUTED_BUILD_RESOURCE) \
	  $(COMPUTED_BUILD_SETTING) \
	  $(COMPUTED_BUILD_VARIANT) \
	  $(COMPUTED_BUILD_INCLUDE) \
	  $(COMPUTED_BUILD_OPTIONS) \
	  --exclude 'qx.*' \
	  --package-id app \
	  --generate-compiled-script \
	  --compiled-script-file $(COMPUTED_BUILD_SCRIPT_NAME) \
	  $(APPLICATION_ADDITIONAL_SCRIPT_BUILD_OPTIONS)


ifeq ($(APPLICATION_OPTIMIZE_BROWSER),true)

exec-script-build-opt:
	@mv $(COMPUTED_BUILD_SCRIPT_NAME) $(COMPUTED_BUILD_SCRIPT_NAME:.js=_all.js)

	$(SILENCE) for BROWSER in $(APPLICATION_INDIVIDUAL_BROWSERS); do \
    $(CMD_GENERATOR) \
      $(COMPUTED_CLASS_PATH) \
      $(COMPUTED_BUILD_SETTING) \
      $(COMPUTED_BUILD_VARIANT) \
      $(COMPUTED_BUILD_INCLUDE) \
      $(COMPUTED_BUILD_OPTIONS) \
      --generate-compiled-script \
      --use-variant qx.client:$$BROWSER \
      --compiled-script-file $(COMPUTED_BUILD_SCRIPT_NAME:.js=_$$BROWSER.js) || exit 1; \
  done

	$(SILENCE) cat $(FRAMEWORK_TOOL_PATH)/make/browser_loader.tmpl.js | \
    $(CMD_PYTHON) -c "import sys; lines = sys.stdin.readlines(); print ''.join(lines) % {'path': sys.argv[1], 'name': sys.argv[2]}" \
      $(APPLICATION_HTML_TO_ROOT_URI)/script \
      $(APPLICATION_SCRIPT_FILENAME:.js=) \
    > $(COMPUTED_BUILD_SCRIPT_NAME)

else

exec-script-build-opt: exec-none

endif







#
# Utility targets
#
exec-pretty:
	$(SILENCE) $(CMD_GENERATOR) \
	  --include-without-dependencies $(APPLICATION_NAMESPACE).* \
	  --pretty-print \
	  $(COMPUTED_CLASS_PATH)

exec-fix:
	$(SILENCE) $(CMD_GENERATOR) \
	  --include-without-dependencies $(APPLICATION_NAMESPACE).* \
	  --fix-source \
	  $(COMPUTED_CLASS_PATH)

exec-migration:
	$(SILENCE) $(CMD_PYTHON) $(FRAMEWORK_TOOL_PATH)/migrator.py \
	  --from-makefile Makefile \
	  --migrate-html \
	  --from-version=$(QOOXDOO_VERSION) \
	  --class-path=$(APPLICATION_SOURCE_PATH)/class,$(APPLICATION_ADDITIONAL_CLASS_PATH) \
	  $(PRETTY_PRINT_OPTIONS)


#
# Debug targets
#
exec-tokenizer:
	$(SILENCE) $(CMD_GENERATOR) \
	  --include-without-dependencies $(APPLICATION_NAMESPACE).* \
	  --store-tokens \
    --token-output-directory $(APPLICATION_DEBUG_PATH)/tokens \
	  $(COMPUTED_CLASS_PATH)

exec-treegenerator:
	$(SILENCE) $(CMD_GENERATOR) \
	  --include-without-dependencies $(APPLICATION_NAMESPACE).* \
	  --store-tree \
    --tree-output-directory $(APPLICATION_DEBUG_PATH)/tree \
	  $(COMPUTED_CLASS_PATH)







check-locales:
	@echo $(APPLICATION_LOCALES) | $(CMD_CHECKLOCALES)

ifdef APPLICATION_LOCALES

exec-localization: check-locales exec-framework-localization
exec-translation: check-locales exec-framework-translation exec-application-translation

else

exec-localization: exec-none
exec-translation: exec-none

endif





exec-framework-localization:
	@echo
	@echo "  PREPARING LOCALIZATION"
	@$(CMD_LINE)
	@mkdir -p $(FRAMEWORK_CACHE_PATH)
	@mkdir -p $(FRAMEWORK_SOURCE_PATH)/class/$(FRAMEWORK_NAMESPACE_PATH)/locale/data
	@echo "  * Processing locales..."
	@for LOC in $(COMPUTED_LOCALES); do \
	  echo "    - Locale: $$LOC"; \
	  mod=0; \
	  if [ ! -r $(FRAMEWORK_CACHE_PATH)/$$LOC.xml -a -r $(FRAMEWORK_SOURCE_PATH)/locale/$$LOC.xml ]; then \
	    echo "      - Copying $$LOC.xml..."; \
	    cp -f $(FRAMEWORK_SOURCE_PATH)/locale/$$LOC.xml $(FRAMEWORK_CACHE_PATH)/$$LOC.xml; \
	    mod=1; \
	  fi; \
	  if [ ! -r $(FRAMEWORK_CACHE_PATH)/$$LOC.xml ]; then \
	    echo "      - Downloading $$LOC.xml..."; \
	    (which wget > /dev/null 2>&1 && wget $(FRAMEWORK_CLDR_DOWNLOAD_URI)/$$LOC.xml -q -P $(FRAMEWORK_CACHE_PATH)) || \
        (which curl > /dev/null 2>&1 && curl $(FRAMEWORK_CLDR_DOWNLOAD_URI)/$$LOC.xml -s -o $(FRAMEWORK_CACHE_PATH)/$$LOC.xml); \
	    mod=1; \
		  if [ ! -r $(FRAMEWORK_CACHE_PATH)/$$LOC.xml ]; then \
		    echo "        - Download failed! Please install wget (preferred) or curl."; \
		    exit 1; \
		  fi; \
	  fi; \
	  if [ ! -r $(FRAMEWORK_SOURCE_PATH)/class/$(FRAMEWORK_NAMESPACE_PATH)/locale/data/$$LOC.js -o $$mod -eq 1 ]; then \
	    echo "      - Generating $$LOC.js..."; \
	    $(CMD_CLDR) -o $(FRAMEWORK_SOURCE_PATH)/class/$(FRAMEWORK_NAMESPACE_PATH)/locale/data $(FRAMEWORK_CACHE_PATH)/$$LOC.xml; \
	  fi; \
	done

exec-framework-translation:
	@echo
	@echo "  PREPARING FRAMEWORK TRANSLATION"
	@$(CMD_LINE)
	@echo "  * Processing source code..."
	@which xgettext > /dev/null 2>&1 || (echo "    - Please install gettext tools (xgettext)" && exit 1)
	@which msginit > /dev/null 2>&1 || (echo "    - Please install gettext tools (msginit)" && exit 1)
	@which msgmerge > /dev/null 2>&1 || (echo "    - Please install gettext tools (msgmerge)" && exit 1)
	@which diff > /dev/null 2>&1 || (echo "    - Please install diffutils (diff)" && exit 1)

	@mkdir -p $(FRAMEWORK_SOURCE_PATH)/translation
	@mkdir -p $(FRAMEWORK_SOURCE_PATH)/class/$(FRAMEWORK_NAMESPACE_PATH)/locale/translation

	@touch $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot
	@cp $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot.bak
	@rm -f $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot
	@touch $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot

	@cd $(FRAMEWORK_SOURCE_PATH) && LC_ALL=C xgettext \
	  --language=Java --from-code=UTF-8 \
	  -kthis.trc -kthis.tr -kthis.marktr -kthis.trn:1,2 \
	  -kManager.trc -kManager.tr -kManager.marktr -kManager.trn:1,2 \
	  --sort-by-file --add-comments=TRANSLATION -o translation/messages.pot \
	  `find class -name "*.js"` 2> /dev/null

	@if [ `diff -q -I^\"POT-Creation-Date: -I^\"Content-T -I^\"Language-Team: -d $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot.bak | wc -l` = 0 ]; then \
		cp $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot.bak $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot; \
	fi;
	@rm $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot.bak

	@echo "  * Processing translations..."
	@for LOC in $(COMPUTED_LOCALES); do \
	  echo "    - Translation: $$LOC"; \
	  if [ ! -r $(FRAMEWORK_SOURCE_PATH)/translation/$$LOC.po ]; then \
  	  echo "      - Generating initial translation file..."; \
	    msginit --locale $$LOC --no-translator -i $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot -o $(FRAMEWORK_SOURCE_PATH)/translation/$$LOC.po > /dev/null 2>&1; \
	  else \
	    echo "      - Merging translation file..."; \
	    msgmerge --update -q $(FRAMEWORK_SOURCE_PATH)/translation/$$LOC.po $(FRAMEWORK_SOURCE_PATH)/translation/messages.pot; \
	  fi; \
	  echo "      - Generating catalog..."; \
	  mkdir -p $(FRAMEWORK_SOURCE_PATH)/translation; \
	  $(CMD_MSGFMT) \
	    -n $(FRAMEWORK_NAMESPACE).locale.translation \
	    -d $(FRAMEWORK_SOURCE_PATH)/class/$(FRAMEWORK_NAMESPACE_PATH)/locale/translation \
	    $(FRAMEWORK_SOURCE_PATH)/translation/$$LOC.po; \
	done
	@rm -rf $(FRAMEWORK_SOURCE_PATH)/translation/*~


exec-application-translation:
	@echo
	@echo "  PREPARING APPLICATION TRANSLATION"
	@$(CMD_LINE)
	@echo "  * Processing source code..."

	@which xgettext > /dev/null 2>&1 || (echo "    - Please install gettext tools (xgettext)" && exit 1)
	@which msginit > /dev/null 2>&1 || (echo "    - Please install gettext tools (msginit)" && exit 1)
	@which msgmerge > /dev/null 2>&1 || (echo "    - Please install gettext tools (msgmerge)" && exit 1)

	@mkdir -p $(APPLICATION_SOURCE_PATH)/translation
	@mkdir -p $(APPLICATION_SOURCE_PATH)/class/$(APPLICATION_NAMESPACE_PATH)/translation

	@rm -f $(APPLICATION_SOURCE_PATH)/translation/messages.pot
	@touch $(APPLICATION_SOURCE_PATH)/translation/messages.pot
	@for file in `find $(APPLICATION_SOURCE_PATH)/class -name "*.js"`; do \
	  LC_ALL=C xgettext --language=Java --from-code=UTF-8 \
	  -kthis.trc -kthis.tr -kthis.marktr -kthis.trn:1,2 \
	  -kManager.trc -kManager.tr -kManager.marktr -kManager.trn:1,2 \
	  --sort-by-file --add-comments=TRANSLATION \
	  -o $(APPLICATION_SOURCE_PATH)/translation/messages.pot \
	  `find $(APPLICATION_SOURCE_PATH)/class -name "*.js"` 2>&1 | grep -v warning; \
	  break; done

	@echo "  * Processing translations..."
	@for LOC in $(COMPUTED_LOCALES); do \
	  echo "    - Translation: $$LOC"; \
	  if [ ! -r $(APPLICATION_SOURCE_PATH)/translation/$$LOC.po ]; then \
  	    echo "      - Generating initial translation file..."; \
	    msginit --locale $$LOC --no-translator -i $(APPLICATION_SOURCE_PATH)/translation/messages.pot -o $(APPLICATION_SOURCE_PATH)/translation/$$LOC.po > /dev/null 2>&1; \
	  else \
	    echo "      - Merging translation file..."; \
	    msgmerge --update -q $(APPLICATION_SOURCE_PATH)/translation/$$LOC.po $(APPLICATION_SOURCE_PATH)/translation/messages.pot; \
	  fi; \
	  echo "      - Generating catalog..."; \
	  mkdir -p $(APPLICATION_SOURCE_PATH)/translation; \
	  $(CMD_MSGFMT) \
	    -n $(APPLICATION_NAMESPACE).translation \
	    -d $(APPLICATION_SOURCE_PATH)/class/$(APPLICATION_NAMESPACE_PATH)/translation \
	    $(APPLICATION_SOURCE_PATH)/translation/$$LOC.po; \
	done
	@rm -rf $(APPLICATION_SOURCE_PATH)/translation/*~







#
# File copy targets
#

exec-files-build:
	@echo
	@echo "  COPYING OF FILES"
	@$(CMD_LINE)
	@echo "  * Copying files..."
	@mkdir -p $(APPLICATION_BUILD_PATH)
	@for file in $(APPLICATION_FILES); do \
		echo "    - Processing $$file"; \
		cp -Rf $(APPLICATION_SOURCE_PATH)/$$file $(APPLICATION_BUILD_PATH); \
	done

exec-files-api:
	@echo
	@echo "  COPYING OF FILES"
	@$(CMD_LINE)
	@echo "  * Copying files..."
	@mkdir -p $(APPLICATION_API_PATH)
	@for file in $(APIVIEWER_FILES); do \
		echo "    - Processing $$file"; \
		cp -Rf $(APIVIEWER_SOURCE_PATH)/$$file $(APPLICATION_API_PATH); \
  done







#
# API targets
#

exec-api-data:
	$(SILENCE) $(CMD_GENERATOR) \
	  --generate-api-documentation \
	  --api-separate-files \
	  --api-documentation-json-file $(APPLICATION_API_PATH)/script/apidata.js \
	  $(COMPUTED_CLASS_PATH) \
	  $(COMPUTED_API_INCLUDE)

exec-api-build:
	$(SILENCE) $(CMD_GENERATOR) \
	  --class-path $(FRAMEWORK_SOURCE_PATH)/class \
	  --class-path $(APIVIEWER_SOURCE_PATH)/class \
	  --include apiviewer \
	  --include qx.component.init.Gui \
	  --add-require qx.log.Logger:qx.log.appender.Native \
	  --use-setting qx.minLogLevel:700 \
	  --use-variant qx.debug:off \
    --use-setting qx.theme:qx.theme.ClassicRoyale \
    --use-setting qx.application:apiviewer.Application \
    --include qx.theme.ClassicRoyale,qx.theme.classic.color.Royale,qx.theme.classic.Border,qx.theme.classic.font.Default,qx.theme.classic.Widget,qx.theme.classic.Appearance,qx.theme.icon.Nuvola \
	  --generate-compiled-script \
	  --compiled-script-file $(APPLICATION_API_PATH)/script/$(APIVIEWER_NAMESPACE_PATH).js \
	  --optimize-strings --optimize-variables \
	  --copy-resources \
	  --resource-input $(FRAMEWORK_SOURCE_PATH)/resource \
	  --resource-output $(APPLICATION_API_PATH)/resource/$(FRAMEWORK_NAMESPACE_PATH) \
	  --resource-input $(APIVIEWER_SOURCE_PATH)/resource \
	  --resource-output $(APPLICATION_API_PATH)/resource/$(APIVIEWER_NAMESPACE_PATH) \
	  --enable-resource-filter \
	  --use-setting $(FRAMEWORK_NAMESPACE).resourceUri:resource/$(FRAMEWORK_NAMESPACE_PATH) \
	  --use-setting $(APIVIEWER_NAMESPACE).resourceUri:resource/$(APIVIEWER_NAMESPACE_PATH) \
	  --use-setting $(APIVIEWER_NAMESPACE).title:$(APPLICATION_API_TITLE)




#
# qooxdoo-contrib targets
#
exec-download-contribs:
	$(SILENCE) $(CMD_DOWNLOAD_CONTRIB) \
		$(patsubst contrib://%, --contrib %, $(DOWNLOAD_CONTRIBS)) \
		--contrib-cache "$(QOOXDOO_INCLUDE_CACHE)"



#
# Publish targets
#
exec-publish:
	@echo "  * Syncing files..."
	$(SILENCE) $(CMD_SYNC_ONLINE) $(APPLICATION_BUILD_PATH)/* $(APPLICATION_PUBLISH_PATH)







#
# None helper target
#
exec-none:
	@true






################################################################################
# INFO TARGETS
################################################################################

info-build:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING BUILD VERSION OF $(APPLICATION_MAKE_TITLE)"
	@echo "****************************************************************************"

info-source:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING SOURCE VERSION OF $(APPLICATION_MAKE_TITLE)"
	@echo "****************************************************************************"

info-api:
	@echo
	@echo "****************************************************************************"
	@echo "  GENERATING API VIEWER FOR $(APPLICATION_MAKE_TITLE)"
	@echo "****************************************************************************"

info-pretty:
	@echo
	@echo "****************************************************************************"
	@echo "  PRETTIFYING $(APPLICATION_MAKE_TITLE) CLASSES"
	@echo "****************************************************************************"

info-fix:
	@echo
	@echo "****************************************************************************"
	@echo "  FIXING $(APPLICATION_MAKE_TITLE) CLASSES"
	@echo "****************************************************************************"

info-help:
	@echo
	@echo "****************************************************************************"
	@echo "  HELP FOR $(APPLICATION_MAKE_TITLE)"
	@echo "****************************************************************************"

info-clean:
	@echo
	@echo "****************************************************************************"
	@echo "  CLEANING UP $(APPLICATION_MAKE_TITLE)"
	@echo "****************************************************************************"

info-distclean:
	@echo
	@echo "****************************************************************************"
	@echo "  CLEANING UP $(APPLICATION_MAKE_TITLE)" COMPLETELY
	@echo "****************************************************************************"

info-publish:
	@echo
	@echo "****************************************************************************"
	@echo "  PUBLISHING $(APPLICATION_MAKE_TITLE)"
	@echo "****************************************************************************"

info-debug:
	@echo
	@echo "****************************************************************************"
	@echo "  CREATING DEBUG DATA FOR $(APPLICATION_MAKE_TITLE)"
	@echo "****************************************************************************"
