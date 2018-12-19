(function() {
    /**
     * WAI is the namespace for the functions returned by this module.
     */
    var WAI = function() {
    };

    /**
     * Check all navigation containers and regions have accessible names and
     * do not allow 2 regions in the same page with the same name.
     * Throws an error if the validation fails.
     *
     * @method validatePageRegionLabels
     * @return {Boolean} true on success.
     */
    WAI.prototype.validatePageRegionLabels = async function() {
        let navigations,
            name;

        navigations = await reader.findAllInPage('navigation');
        await reader.expectUniqueLabels(navigations);

        regions = await reader.findAllInPage('region');
        await reader.expectUniqueLabels(regions);

        return true;
    };

    /**
     * Check accessibility for a rearrangeable list box.
     *
     * @method validateRearrangeableListBox
     * @param {NodeWrapper} The from list
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateRearrangeableListBox = async function(fromlist, tolist, moveto, movefrom) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-rearrangeable.html
        let movetobutton, movefrombutton, fromcount, tocount;

        await reader.waitForInteraction(true);
        await reader.focus(fromlist);
        await reader.sendSpecialKey(reader.specialKeys.TAB);

        explainTest('The from listbox is labelled');
        expect(reader.getAccessibleName(fromlist)).to.not.be('');
        explainTest('The from listbox is visible');
        expect(reader.isVisible(fromlist)).to.be(true);
        explainTest('The element has the correct role (listBox)');
        expect(reader.getRole(fromlist)).to.be("listBox");

        explainTest('The to listbox is labelled');
        expect(reader.getAccessibleName(tolist)).to.not.be('');
        explainTest('The to listbox is visible');
        expect(reader.isVisible(tolist)).to.be(true);
        explainTest('The element has the correct role (listBox)');
        expect(reader.getRole(tolist)).to.be("listBox");

        explainTest('The move to button is labelled');
        expect(reader.getAccessibleName(moveto)).to.not.be('');
        explainTest('The move to button is visible');
        expect(reader.isVisible(moveto)).to.be(true);
        explainTest('The element has the correct role (button)');
        expect(reader.getRole(moveto)).to.be("button");

        explainTest('The move from button is labelled');
        expect(reader.getAccessibleName(movefrom)).to.not.be('');
        explainTest('The move from button is visible');
        expect(reader.isVisible(movefrom)).to.be(true);
        explainTest('The element has the correct role (button)');
        expect(reader.getRole(movefrom)).to.be("button");

        explainTest('The listBox has options');
        options = await reader.findAll(fromlist, 'listBoxOption');
        expect(options).not.to.be.empty();
        fromcount = options.length;

        for (i = 0; i < options.length; i++) {
            option = options[i];
            expect(reader.getAccessibleName(option)).to.not.be('');
            expect(reader.isVisible(option)).to.be(true);
            expect(reader.isFocusable(option)).to.be(true);
        }
        await reader.focus(fromlist);
        explainTest('The listbox is controllable with the keyboard');
        explainTest('The down arrow selected the next option');
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        option = await reader.getActiveDescendant(fromlist);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[1]);
        expect(activeName).to.be(expectedName);
        explainTest('The up arrow selected the previous option');
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        option = await reader.getActiveDescendant(fromlist);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);
        explainTest('The end key selected last option');
        await reader.sendSpecialKey(reader.specialKeys.END);
        option = await reader.getActiveDescendant(fromlist);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[options.length - 1]);
        expect(activeName).to.be(expectedName);
        explainTest('The home key selected first option');
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        option = await reader.getActiveDescendant(fromlist);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);

        options = await reader.findAll(tolist, 'listBoxOption');
        tocount = options.length;
        await reader.doDefault(moveto);
        await reader.waitForInteraction(true);
        explainTest('The first option was moved');
        options = await reader.findAll(fromlist, 'listBoxOption');
        expect(options.length).to.be(fromcount - 1);
        options = await reader.findAll(tolist, 'listBoxOption');
        expect(options.length).to.be(tocount + 1);
        explainTest('The first option was moved back');
        await reader.doDefault(movefrom);
        await reader.waitForInteraction(true);
        options = await reader.findAll(fromlist, 'listBoxOption');
        expect(options.length).to.be(fromcount);
        options = await reader.findAll(tolist, 'listBoxOption');
        expect(options.length).to.be(tocount);
        
        return true;
    };

    /**
     * Check accessibility for a collapsible list box.
     *
     * @method validateCollapsibleListBox
     * @param {NodeWrapper} The node that represents the element.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateCollapsibleListBox = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-collapsible.html
        let options, i, option, activeName, expectedName, hasPopup, expanded, listBox;

        explainTest('The listbox is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
        explainTest('The listbox is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (popUpButton)');
        expect(reader.getRole(wrapper)).to.be("popUpButton");
        hasPopup = await reader.getAttributeValue(wrapper, 'aria-haspopup');
        expect(hasPopup).to.be("listbox");
        await reader.doDefault(wrapper);
        expanded = await reader.getAttributeValue(wrapper, 'aria-expanded');
        expect(expanded).to.be("true");

        listBox = await reader.findInPage('listBox', '');

        explainTest('The listBox has options');
        options = await reader.findAll(listBox, 'listBoxOption');
        expect(options).not.to.be.empty();

        for (i = 0; i < options.length; i++) {
            option = options[i];
            expect(reader.getAccessibleName(option)).to.not.be('');
            expect(reader.isVisible(option)).to.be(true);
            expect(reader.isFocusable(option)).to.be(true);
        }
        explainTest('The listbox is controllable with the keyboard');
        explainTest('The down arrow selected the next option');
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        option = await reader.getActiveDescendant(listBox);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[1]);
        expect(activeName).to.be(expectedName);
        explainTest('The up arrow selected the previous option');
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        option = await reader.getActiveDescendant(listBox);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);
        explainTest('The end key selected last option');
        await reader.sendSpecialKey(reader.specialKeys.END);
        option = await reader.getActiveDescendant(listBox);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[options.length - 1]);
        expect(activeName).to.be(expectedName);
        explainTest('The home key selected first option');
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        option = await reader.getActiveDescendant(listBox);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);

        return true;
    };

    /**
     * Check accessibility for a scrollable list box.
     *
     * @method validateScrollableListBox
     * @param {NodeWrapper} The node that represents the element.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateScrollableListBox = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-scrollable.html
        let options, i, option, activeName, expectedName;

        explainTest('The listbox is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
        explainTest('The listbox is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (listBox)');
        expect(reader.getRole(wrapper)).to.be("listBox");

        explainTest('The listBox has options');
        options = await reader.findAll(wrapper, 'listBoxOption');
        expect(options).not.to.be.empty();

        for (i = 0; i < options.length; i++) {
            option = options[i];
            expect(reader.getAccessibleName(option)).to.not.be('');
            expect(reader.isVisible(option)).to.be(true);
            expect(reader.isFocusable(option)).to.be(true);
        }
        explainTest('The listbox is controllable with the keyboard');
        await reader.focus(wrapper);
        await reader.waitForInteraction(true);
        explainTest('The down arrow selected the next option');
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        option = await reader.getActiveDescendant(wrapper);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[1]);
        expect(activeName).to.be(expectedName);
        explainTest('The up arrow selected the previous option');
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        option = await reader.getActiveDescendant(wrapper);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);
        explainTest('The end key selected last option');
        await reader.sendSpecialKey(reader.specialKeys.END);
        option = await reader.getActiveDescendant(wrapper);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[options.length - 1]);
        expect(activeName).to.be(expectedName);
        explainTest('The home key selected first option');
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        option = await reader.getActiveDescendant(wrapper);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);

        return true;
    };

    /**
     * Check accesibility for a disclosure.
     *
     * @method validateDisclosure
     * @param {NodeWrapper} The node that represents the trigger.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateDisclosure = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/disclosure/disclosure-img-long-description.html
        let ariaExpanded;

        explainTest('The button is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
        explainTest('The button is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (button)');
        expect(reader.getRole(wrapper)).to.be("button");
        await reader.waitForInteraction(true);

        ariaExpanded = await reader.getAttributeValue(wrapper, 'aria-expanded');

        explainTest('The disclosure is initially closed');
        expect(ariaExpanded).to.be('false');
        await reader.doDefault(wrapper);

        ariaExpanded = await reader.getAttributeValue(wrapper, 'aria-expanded');
        explainTest('The disclosure is now open');
        expect(ariaExpanded).to.be('true');

        controls = reader.getControls(wrapper);
        explainTest('The element controls a list of fields');
        expect(controls).not.to.be.empty();
        expect(reader.isVisible(controls[0])).to.be(true);
        await reader.doDefault(wrapper);
        ariaExpanded = await reader.getAttributeValue(wrapper, 'aria-expanded');
        explainTest('The disclosure is now closed');
        expect(ariaExpanded).to.be('false');
        
        return true;
    };

    /**
     * Check the accessibility of the tab list.
     *
     * @method validateTablist
     * @param {NodeWrapper} The node that we are testing.
     * @param {Boolean} Manual switching of tabs.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateTablist = async function(wrapper, manual = false) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/tabs/tabs-1/tabs.html
        let tabs,
            panel,
            tab,
            i,
            selected;

        explainTest('The tab list is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (tablist)');
        expect(reader.getRole(wrapper)).to.be("tabList");
        explainTest('The tab list is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');

        tabs = await reader.findAll(wrapper, 'tab');
        expect(tabs).not.to.be.empty();
        for (i = 0; i < tabs.length; i++) {
            tab = tabs[i];
            await reader.focus(tab);
            await reader.waitForInteraction(true);
            if (manual) {
                await reader.sendSpecialKey(reader.specialKeys.ENTER);
                await reader.waitForInteraction();
            }
            
            explainTest('The tab element has the correct role (tab)');
            expect(reader.getRole(tab)).to.be("tab");
            selected = await reader.getAttributeValue(tab, 'aria-selected');
            expect(selected).to.be("true");
            panel = reader.getControls(tab);
            expect(panel).not.to.be.empty();
            
            explainTest('Right key selects the next tab');
            await reader.sendSpecialKey(reader.specialKeys.RIGHT_ARROW);
            await reader.waitForInteraction();
            if (manual) {
                await reader.sendSpecialKey(reader.specialKeys.ENTER);
            }

            explainTest('Left key selects the previous tab');
            await reader.sendSpecialKey(reader.specialKeys.LEFT_ARROW);
            await reader.waitForInteraction();
            if (manual) {
                await reader.sendSpecialKey(reader.specialKeys.ENTER);
            }
            
            await reader.sendSpecialKey(reader.specialKeys.RIGHT_ARROW);
            await reader.waitForInteraction();
            if (manual) {
                await reader.sendSpecialKey(reader.specialKeys.ENTER);
            }
        }
        explainTest('Home key selects the first tab');
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        if (manual) {
            await reader.sendSpecialKey(reader.specialKeys.ENTER);
        }
        selected = await reader.getAttributeValue(tabs[0], 'aria-selected');
        expect(selected).to.be("true");
        
        explainTest('End key selects the last tab');
        await reader.sendSpecialKey(reader.specialKeys.END);
        if (manual) {
            await reader.sendSpecialKey(reader.specialKeys.ENTER);
        }
        selected = await reader.getAttributeValue(tabs[tabs.length - 1], 'aria-selected');
        expect(selected).to.be("true");

    };

    /**
     * Check the accessibility of the grid.
     *
     * @method validateGridLayout
     * @param {NodeWrapper} The node that we are testing.
     * @param {NodeWrapper} The previous focusable node.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateGridLayout = async function(wrapper, previous) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/grid/LayoutGrids.html
        let rows,
            i,
            j,
            row,
            cell,
            first,
            current,
            name;

        explainTest('The grid is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (grid)');
        expect(reader.getRole(wrapper)).to.be('grid');
        explainTest('The grid is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');

        explainTest('The grid has rows');
        rows = await reader.findAll(wrapper, 'row');
        expect(rows).not.to.be.empty();

        explainTest('Mode focus to the grid');
        first = await reader.find(wrapper, 'link');
        await reader.focus(first);
        await reader.waitForInteraction(true);

        for (i = 0; i < rows.length; i++) {
            row = rows[i];
            explainTest('The row has cells');
            cells = await reader.findAll(row, 'cell');

            if (cells != null) {
                for (j = 0; j < cells.length; j++) {
                    cell = cells[j];

                    // Check it has a label.
                    name = reader.getAccessibleName(cell);
                    expect(name).to.not.be('');

                    await reader.sendSpecialKey(reader.specialKeys.RIGHT_ARROW);
                    await reader.waitForInteraction(true);
                }
            }
        }
        name = reader.getAccessibleName(first);

        await reader.sendSpecialKey(reader.specialKeys.HOME);
        await reader.waitForInteraction(true);
        
        first = await reader.find(wrapper, 'link');
        expect(reader.isFocused(first)).to.be(true);

        await reader.sendSpecialKey(reader.specialKeys.END);
        await reader.waitForInteraction(true);
        
        first = await reader.find(wrapper, 'link');
        expect(reader.isFocused(first)).to.be(false);
    };

    /**
     * Check the accessibility of the table.
     *
     * @method validateTable
     * @param {NodeWrapper} The node that we are testing.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateTable = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/table/table.html
        let rows,
            columns,
            rowheaders,
            columnheaders,
            i,
            j,
            row,
            cell,
            label;

        explainTest('The table is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (table)');
        expect(reader.getRole(wrapper)).to.be('table');
        explainTest('The table is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');

        explainTest('The table has rows');
        rows = await reader.findAll(wrapper, 'row');
        expect(rows).not.to.be.empty();

        rowheaders = [];
        columnheaders = [];
        for (i = 0; i < rows.length; i++) {
            row = rows[i];
            cell = await reader.find(row, 'rowHeader');
            if (cell) {
                rowheaders[i] = reader.getAccessibleName(cell);
            }

            columns = await reader.findAll(row, 'columnHeader');
            if (columns.length > 0) {
                for (j = 0; j < columns.length; j++) {
                    columnheaders[j] = reader.getAccessibleName(columns[j]);
                }
            }
        }
        explainTest('The table has headers');
        expect(columnheaders.length + rowheaders.length).to.not.be(0);

        for (i = 0; i < rows.length; i++) {
            row = rows[i];
            cells = await reader.find(row, 'cell');
            if (cells != null) {
                for (j = 0; j < cells.length; j++) {
                    cell = cells[j];
                    label = '';

                    // Check it has a label.
                    if (typeof rowheaders[i] !== 'undefined') {
                        label = rowheaders[i];
                    } else if (typeof columnheaders[j] !== 'undefined') {
                        label = columnheaders[j];
                    }
                    expect(label).to.not.be('');
                }
            }
        }
    };

    /**
     * Check the accessibility of the toolbar.
     *
     * @method validateToolbar
     * @param {NodeWrapper} The node that we are testing.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateToolbar = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/toolbar/toolbar.html
        let buttons, button, previous, tabIndex, hasPopup, menu, subItems;

        explainTest('The toolbar is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (toolbar)');
        expect(reader.getRole(wrapper)).to.be('toolbar');
        explainTest('The toolbar has buttons ');
        buttons = await reader.findAll(wrapper, 'button');
        expect(buttons).not.to.be.empty();

        button = buttons[0];
        await reader.focus(button);
        await reader.waitForInteraction(true);

        button = await reader.findByTabIndex(wrapper);

        while (button) {
            // Start from the first button.
            expect(reader.isFocusable(button)).to.be(true);

            tabIndex = await reader.getAttributeValue(button, 'tabindex');
            expect(tabIndex).to.be('0');

            hasPopup = await reader.getAttributeValue(button, 'aria-haspopup');

            // If this is a menu we should open and close it.
            if (hasPopup == 'true') {
                explainTest('Can open and close the menu');
                await reader.sendSpecialKey(reader.specialKeys.ENTER);
                await reader.waitForInteraction(true);
                await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
                await reader.waitForInteraction(true);
            }
            
            previous = button;
            await reader.sendSpecialKey(reader.specialKeys.RIGHT_ARROW);
            button = await reader.findByTabIndex(wrapper);
            if (previous.equals(button)) {
                button = null;
            }
        }

        
    };


    /**
     * Check the accessibility of the link.
     *
     * @method validateLink
     * @param {NodeWrapper} The node that we are testing.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateLink = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/link/link.html
        explainTest('The link is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (link)');
        expect(reader.getRole(wrapper)).to.be("link");
        explainTest('The link is focusable');
        expect(reader.isFocusable(wrapper)).to.be(true);
        explainTest('The link is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
    };

    /**
     * Check the accessibility of the slider.
     *
     * @method validateSlider
     * @param {NodeWrapper} The node that we are testing.
     * @param {Boolean} Check multiple steps can be jumped with page up/down.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateSlider = async function(wrapper, checkMulti = false) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/slider/slider-1.html
        let value, min, max;

        await reader.waitForInteraction(true);
        explainTest('The slider is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (slider)');
        expect(reader.getRole(wrapper)).to.be("slider");
        explainTest('The slider is focusable');
        expect(reader.isFocusable(wrapper)).to.be(true);
        explainTest('The slider is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');

        value = await reader.getAttributeValue(wrapper, 'aria-valuenow');
        min = await reader.getAttributeValue(wrapper, 'aria-valuemin');
        max = await reader.getAttributeValue(wrapper, 'aria-valuemax');
        
        explainTest('The slider has a range and value');
        expect(value).to.not.be('');
        expect(min).to.not.be('');
        expect(max).to.not.be('');

        await reader.focus(wrapper);
        await reader.waitForInteraction(true);

        explainTest('The slider works with end and home keys');
        await reader.sendSpecialKey(reader.specialKeys.END);
        await reader.waitForInteraction();
        value = await reader.getAttributeValue(wrapper, 'aria-valuenow');
        expect(value).to.be(max);
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        await reader.waitForInteraction();
        value = await reader.getAttributeValue(wrapper, 'aria-valuenow');
        expect(value).to.be(min);

        explainTest('The slider works with right and left keys');
        await reader.sendSpecialKey(reader.specialKeys.RIGHT_ARROW);
        await reader.waitForInteraction();
        value = await reader.getAttributeValue(wrapper, 'aria-valuenow');
        expect(value).to.not.be(min);
        await reader.sendSpecialKey(reader.specialKeys.LEFT_ARROW);
        await reader.waitForInteraction();
        value = await reader.getAttributeValue(wrapper, 'aria-valuenow');
        expect(value).to.be(min);

        explainTest('The slider works with up and down keys');
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await reader.waitForInteraction();
        value = await reader.getAttributeValue(wrapper, 'aria-valuenow');
        expect(value).to.not.be(min);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await reader.waitForInteraction();
        value = await reader.getAttributeValue(wrapper, 'aria-valuenow');
        expect(value).to.be(min);

        if (checkMulti) {
            explainTest('The slider works with page up and page down keys');
            await reader.sendSpecialKey(reader.specialKeys.PAGE_UP);
            await reader.waitForInteraction();
            value = await reader.getAttributeValue(wrapper, 'aria-valuenow');
            expect(value).to.not.be(min);
            await reader.sendSpecialKey(reader.specialKeys.PAGE_DOWN);
            await reader.waitForInteraction();
            value = await reader.getAttributeValue(wrapper, 'aria-valuenow');
            expect(value).to.be(min);
        }
    };

    /**
     * Check the accessibility of the feed.
     *
     * @method validateFeed
     * @param {NodeWrapper} The node that we are testing.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateFeed = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/feed/feedDisplay.html
        let articles, i, article, size, position, firstIndex, secondIndex;

        explainTest('The feed is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (feed)');
        expect(reader.getRole(wrapper)).to.be("feed");
        await reader.waitForInteraction(true);

        explainTest('The feed contains a list of articles');
        articles = await reader.findAll(wrapper, 'article');
        expect(articles).not.to.be.empty();

        for (i = 0; i < articles.length; i++) {
            article = articles[i];
            explainTest('The article is labelled');
            expect(reader.getAccessibleName(article)).to.not.be('');
            explainTest('The article is focusable');
            expect(reader.isFocusable(article)).to.be(true);
            size = await reader.getAttributeValue(article, 'aria-setsize');
            position = await reader.getAttributeValue(article, 'aria-posinset');
            
            explainTest('The article is numbered correctly in the list');
            expect(position).to.be('' + (i + 1));
            explainTest('The list has the correct number of elements');
            expect(size).to.be('' + articles.length);
        }

        explainTest('The feed supports keyboard navigation');
        articles = await reader.findAll(wrapper, 'article');
        if (articles.length > 1) {
            explainTest('Move focus to the first article');
            await reader.focus(articles[0]);
            await reader.waitForInteraction(true);
            expect(reader.isFocused(articles[0])).to.be(true);
            
            explainTest('Move focus to the second article');
            await reader.sendSpecialKey(reader.specialKeys.PAGE_DOWN);
            await reader.waitForInteraction(true);
            expect(reader.isFocused(articles[1])).to.be(true);

            explainTest('Move focus back to the first article');
            await reader.sendSpecialKey(reader.specialKeys.PAGE_UP);
            await reader.waitForInteraction(true);
            expect(reader.isFocused(articles[0])).to.be(true);
        }

        return true;
    };

    /**
     * Check accesibility for a mixed checkbox controling a list of single checkboxes.
     *
     * @method validateMixedCheckbox
     * @param {NodeWrapper} The node that represents the mixed state checkbox.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateMixedCheckbox = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/checkbox/checkbox-2/checkbox-2.html
        let controls, allChecked, i, checked;

        explainTest('The checkbox is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
        explainTest('The checkbox is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (checkBox)');
        expect(reader.getRole(wrapper)).to.be("checkBox");

        controls = reader.getControls(wrapper);
        explainTest('The element controls a list of fields');
        expect(controls).not.to.be.empty();

        // Check the group.
        explainTest('Changing the group affects each item in the list');
        allChecked = await reader.getChecked(wrapper);
        if (allChecked != 'true') {
            await reader.doDefault(wrapper);
        }
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('true');

        for (i = 0; i < controls.length; i++) {
            checked = await reader.getChecked(controls[i]);
            expect(checked).to.be('true');
        }
        await reader.focus(wrapper);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('false');

        for (i = 0; i < controls.length; i++) {
            checked = await reader.getChecked(controls[i]);
            expect(checked).to.be('false');
        }
        explainTest('Changing one item in the group sets the group to a mixed state');
        await reader.doDefault(controls[0]);
        checked = await reader.getChecked(controls[0]);
        expect(checked).to.be('true');
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('mixed');

        explainTest('Spacebar on the group cycles between true, false and mixed states');

        await reader.focus(wrapper);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await reader.waitForInteraction();
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('true');

        await reader.focus(wrapper);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await reader.waitForInteraction();
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('false');

        await reader.focus(wrapper);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await reader.waitForInteraction();
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('mixed');

        explainTest('When mixed state is restored, the checked state of the items matches the last mixed state');

        checked = await reader.getChecked(controls[0]);
        expect(checked).to.be('true');
        return true;
    };
    /**
     * Check labels attributes for a checkbox.
     *
     * @method validateCheckbox
     * @param {NodeWrapper} The node that represents the checkbox.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateCheckbox = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/checkbox/checkbox-1/checkbox-1.html
        let checked = false,
            toggleChecked = false;

        explainTest('The checkbox is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
        explainTest('The checkbox is visible');
        expect(reader.isVisible(wrapper)).to.be(true);

        explainTest('The element has the correct role (checkBox)');
        expect(reader.getRole(wrapper)).to.be("checkBox");

        explainTest('The checkbox can be focused');
        expect(reader.isFocusable(wrapper)).to.be(true);

        explainTest('The checkbox can be toggled');
        checked = await reader.getAttributeValue(wrapper, 'aria-checked');
        await reader.doDefault(wrapper);
        toggleChecked = await reader.getAttributeValue(wrapper, 'aria-checked');
        expect(checked).not.to.be(toggleChecked);

        explainTest('The checkbox can be toggled back');
        await reader.doDefault(wrapper);
        toggleChecked = await reader.getAttributeValue(wrapper, 'aria-checked');
        expect(checked).to.be(toggleChecked);

        return true;
    };

    /**
     * Check labels attributes for a button.
     *
     * @method validateButton
     * @param {NodeWrapper} The node that represents the button.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateButton = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/button/button.html
        explainTest('The button is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The button has the correct role (button)');
        expect(reader.getRole(wrapper)).to.be("button");
        explainTest('The button can be focused');
        expect(reader.isFocusable(wrapper)).to.be(true);
        return true;
    };

    /**
     * Check labels attributes for a toggle button.
     *
     * @method validateToggleButton
     * @param {NodeWrapper} The node that represents the button.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateToggleButton = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/button/button.html
        let pressed = false, togglePressed = false;

        explainTest('The button is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The button has the correct role (toggleButton)');
        expect(reader.getRole(wrapper)).to.be("toggleButton");
        explainTest('The button can be focused');
        expect(reader.isFocusable(wrapper)).to.be(true);
        explainTest('The button can be toggled');
        pressed = await reader.getAttributeValue(wrapper, 'aria-pressed');
        await reader.doDefault(wrapper);
        togglePressed = await reader.getAttributeValue(wrapper, 'aria-pressed');
        expect(pressed).not.to.be(togglePressed);
        explainTest('The button can be toggled back');
        await reader.doDefault(wrapper);
        togglePressed = await reader.getAttributeValue(wrapper, 'aria-pressed');
        expect(pressed).to.be(togglePressed);

        return true;
    };

    /**
     * Check labels and keyboard navigation for a menu of links.
     * Throws an error if the validation fails.
     *
     * @method validateMenuBar
     * @param {String} role The expected role of the menu button to validate.
     * @param {String} label The expected label text of the menu button to validate.
     * @param {Boolean} search Check searching of menu entries.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateMenuBar = async function(role, label, search = false) {
        // Example
        // http://www.w3.org/TR/wai-aria-practices-1.1/examples/menubar/menubar-1/menubar-1.html
        let menuBar,
            menuItems,
            menuSubItems,
            menuSize,
            menu,
            i,
            done;

        menuBar = await reader.findInPage(role, label);

        explainTest('The menu bar can be found with role: "' + role + '" and label: "' + label + '"');
        menuItems = await reader.findAll(menuBar, 'menuItem');
        explainTest('The menu has menu entries');
        expect(menuItems.length).not.to.be(0);
        explainTest('The menu entries have unique labels');
        await reader.expectUniqueLabels(menuItems);
        menuSize = menuItems.length;

        reader.focus(menuItems[0]);
        await reader.waitForInteraction();

        // Use the right arrow key to navigate through all the menu items.
        for (i = 0; i < menuItems.length - 1; i++) {

            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getSelectedMenuIndex(menuBar)).to.be(i);
            done = reader.waitForFocusChange(menuBar);
            await reader.sendSpecialKey(reader.specialKeys.RIGHT_ARROW);
            await done;
            explainTest('After the right key, the currently selected menu item is ' + (i + 1));
            expect(await reader.getSelectedMenuIndex(menuBar)).to.be(i + 1);
        }
        // Press the left arrow to move back.
        for (i = menuItems.length - 1; i > 0; i--) {
            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getSelectedMenuIndex(menuBar)).to.be(i);
            done = reader.waitForFocusChange(menuBar);
            await reader.sendSpecialKey(reader.specialKeys.LEFT_ARROW);
            await done;
            explainTest('After the left key, the currently selected menu item is ' + (i - 1));
            expect(await reader.getSelectedMenuIndex(menuBar)).to.be(i - 1);
        }
        // Check that now left and right wrap around the menu.
        done = reader.waitForFocusChange(menuBar);
        await reader.sendSpecialKey(reader.specialKeys.LEFT_ARROW);
        await done;
        await reader.pause(3000);
        menuBar = await reader.findInPage(role, label);
        explainTest('After the left key, the selected menu item is the last one');
        expect(await reader.getSelectedMenuIndex(menuBar)).to.be(menuSize - 1);

        explainTest('After the right key, the selected menu item is the first one');
        done = reader.waitForFocusChange(menuBar);
        await reader.sendSpecialKey(reader.specialKeys.RIGHT_ARROW);
        await done;
        menuBar = await reader.findInPage(role, label);
        expect(await reader.getSelectedMenuIndex(menuBar)).to.be(0);

        explainTest('After the down key, the menu is opened');
        done = reader.waitForFocusChange(menuBar);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;

        ariaExpanded = await reader.getAttributeValue(menuItems[0], 'aria-expanded');
        explainTest('The menu is now opened');
        expect(ariaExpanded).to.be('true');

        done = reader.waitForNodeCollapsed(menuItems[0]);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        ariaExpanded = await reader.getAttributeValue(menuItems[0], 'aria-expanded');
        explainTest('The menu is now closed');
        expect(ariaExpanded).to.be('false');

        // Space should open the menu.
        done = reader.waitForNodeExpanded(menuItems[0]);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await done;

        ariaExpanded = await reader.getAttributeValue(menuItems[0], 'aria-expanded');
        explainTest('The menu is now opened');
        expect(ariaExpanded).to.be('true');

        menu = await reader.findInPage('menu', '');
        menuSubItems = await reader.findAll(menu, 'menuItem');
        menuSize = menuSubItems.length;
        explainTest('The menu has menu entries');
        expect(menuSubItems.length).not.to.be(0);

        // Use the down arrow key to navigate through all the menu items.
        for (i = 0; i < menuSubItems.length - 1; i++) {

            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i);
            done = reader.waitForFocusChange(menu);
            await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
            await done;
            await reader.waitForInteraction(false);
            explainTest('After the down key, the currently selected menu item is ' + (i + 1));
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i + 1);
        }
        // Press the left arrow to move back.
        for (i = menuSubItems.length - 1; i > 0; i--) {
            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i);
            done = reader.waitForFocusChange(menu);
            await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
            await done;
            await reader.waitForInteraction(false);
            explainTest('After the up key, the currently selected menu item is ' + (i - 1));
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i - 1);
        }
        // Check that now left and right wrap around the menu.
        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await done;
        await reader.pause(3000);
        menu = await reader.findInPage('menu', '');
        explainTest('After the up key, the selected menu item is the last one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        explainTest('After the down key, the selected menu item is the first one');
        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;
        menu = await reader.findInPage('menu', '');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(0);

        return true;
    };

    /**
     * Check labels and keyboard navigation for a menu of actions.
     * Throws an error if the validation fails.
     *
     * @method validateMenuButtonActions
     * @param {String} role The expected role of the menu button to validate.
     * @param {String} label The expected label text of the menu button to validate.
     * @param {Boolean} search Check searching of menu entries.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateMenuButtonActions = async function(role, label, search = false) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-actions.html
        let menuButton,
            ariaExpanded,
            menu,
            menuItems,
            i,
            done,
            menuSize,
            searchMenuItemLabel;

        menuButton = await reader.findInPage(role, label);

        explainTest('The menu button can be found with role: "' + role + '" and label: "' + label + '"');

        await reader.focus(menuButton);

        // Check the menu is closed until we act on the button.
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');

        explainTest('The menu is initially closed');
        expect(ariaExpanded).to.be('false');

        // First we will action the button
        await reader.waitForInteraction(true);
        await reader.doDefault(menuButton);
        await reader.waitForInteraction(true);

        // Now the menu should be expanded.
        ariaExpanded = reader.getAttributeValue(menuButton, 'aria-expanded');
        explainTest('The menu is expanded when the button is actioned');
        expect(ariaExpanded).to.be('true');
        
        // The menu should now be findable from aria-controls.
        menu = reader.getSingleControl(menuButton);

        // The role of the menu should be "menu"
        explainTest('The menu is visible');
        expect(reader.isVisible(menu)).to.be(true);
        explainTest('The menu has the correct role (menu)');
        expect(reader.getRole(menu)).to.be("menu");

        menuItems = await reader.findAll(menu, 'menuItem');

        explainTest('The menu has menu entries');
        expect(menuItems.length).not.to.be(0);
        explainTest('The menu entries have unique labels');
        await reader.expectUniqueLabels(menuItems);
        menuSize = menuItems.length;

        // Use the down arrow key to navigate through all the menu items.
        for (i = 0; i < menuItems.length - 1; i++) {
            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i);
            done = reader.waitForFocusChange(menu);
            await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
            await done;
            explainTest('After the down key, the currently selected menu item is ' + (i + 1));
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i + 1);
        }
        // Press the up arrow to move back.
        for (i = menuItems.length - 1; i > 0; i--) {
            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i);
            done = reader.waitForFocusChange(menu);
            await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
            await done;
            explainTest('After the up key, the currently selected menu item is ' + (i - 1));
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i - 1);
        }
        // Check that now up and down wrap around the menu.
        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await done;
        await reader.pause(3000);
        menu = reader.getSingleControl(menuButton);
        explainTest('After the up key, the selected menu item is the last one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        explainTest('After the down key, the selected menu item is the first one');
        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        expect(await reader.getSelectedMenuIndex(menu)).to.be(0);
        
        // Check that Home and End keys go to start and end.
        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.END);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the end key, the selected menu item is the last one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the home key, the selected menu item is the first one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(0);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Space should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the space key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Enter should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ENTER);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the enter key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Down arrow should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the down key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Escape key again should not open the menu again.
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;
        await reader.waitForInteraction();
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');

        explainTest('The menu is still closed after escape key was pressed twice');
        expect(ariaExpanded).to.be('false');

        // Up arrow should open the menu and select the last item..
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the up key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        explainTest('After the up key, the selected menu item is the last one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        if (search) {
            menuItems = await reader.findAll(menu, 'menuItem');
            searchMenuItemLabel = reader.getAccessibleName(menuItems[0]);
            done = reader.waitForFocusChange(menu);
            await reader.sendKey(searchMenuItemLabel[0]);
            await done;
            // Delay for focus stuff.
            await reader.waitForInteraction();

            explainTest('After searching, the selected menu item is the first menu item');
            expect(await reader.getSelectedMenuIndex(menu)).to.be(0);

            if (menuItems.length > 1) {
                searchMenuItemLabel = reader.getAccessibleName(menuItems[1]);
                done = reader.waitForFocusChange(menu);
                await reader.sendKey(searchMenuItemLabel[0]);
                await done;
                // Delay for focus stuff.
                await reader.waitForInteraction();

                explainTest('After searching, the selected menu item is the second menu item');
                expect(await reader.getSelectedMenuIndex(menu)).to.be(1);
            }
        }

        // Finish with a closed menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        return true;
    };

    /**
     * Check labels and keyboard navigation for a menu managed with active descendant.
     * Throws an error if the validation fails.
     *
     * @method validateMenuButtonActiveDescendant
     * @param {String} role The expected role of the menu button to validate.
     * @param {String} label The expected label text of the menu button to validate.
     * @param {Boolean} search Check searching of menu entries.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateMenuButtonActiveDescendant = async function(role, label, search = false) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-actions.html
        let menuButton,
            ariaExpanded,
            menu,
            menuItems,
            activeItem,
            i,
            done,
            menuSize,
            searchMenuItemLabel;

        menuButton = await reader.findInPage(role, label);

        explainTest('The menu button can be found with role: "' + role + '" and label: "' + label + '"');

        await reader.focus(menuButton);

        // Check the menu is closed until we act on the button.
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');

        explainTest('The menu is initially closed');
        expect(ariaExpanded).to.be('false');

        // First we will action the button
        await reader.waitForInteraction(true);
        await reader.doDefault(menuButton);
        await reader.waitForInteraction(true);

        // Now the menu should be expanded.
        ariaExpanded = reader.getAttributeValue(menuButton, 'aria-expanded');
        explainTest('The menu is expanded when the button is actioned');
        expect(ariaExpanded).to.be('true');
        
        // The menu should now be findable from aria-controls.
        menu = reader.getSingleControl(menuButton);

        // The role of the menu should be "menu"
        explainTest('The menu is visible');
        expect(reader.isVisible(menu)).to.be(true);
        explainTest('The menu has the correct role (menu)');
        expect(reader.getRole(menu)).to.be("menu");

        menuItems = await reader.findAll(menu, 'menuItem');

        explainTest('The menu has menu entries');
        expect(menuItems.length).not.to.be(0);
        explainTest('The menu entries have unique labels');
        await reader.expectUniqueLabels(menuItems);
        menuSize = menuItems.length;

        // Use the down arrow key to navigate through all the menu items.
        for (i = 0; i < menuItems.length - 1; i++) {
            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getMenuActiveDescendantIndex(menu)).to.be(i);
            await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
            await reader.waitForInteraction();
            explainTest('After the down key, the currently selected menu item is ' + (i + 1));
            expect(await reader.getMenuActiveDescendantIndex(menu)).to.be(i + 1);
        }
        // Press the up arrow to move back.
        for (i = menuItems.length - 1; i > 0; i--) {
            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getMenuActiveDescendantIndex(menu)).to.be(i);
            await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
            await reader.waitForInteraction();
            explainTest('After the up key, the currently selected menu item is ' + (i - 1));
            expect(await reader.getMenuActiveDescendantIndex(menu)).to.be(i - 1);
        }
        // Check that now up and down wrap around the menu.
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await reader.waitForInteraction();
        await reader.pause(3000);
        menu = reader.getSingleControl(menuButton);
        explainTest('After the up key, the selected menu item is the last one');
        expect(await reader.getMenuActiveDescendantIndex(menu)).to.be(menuSize - 1);

        explainTest('After the down key, the selected menu item is the first one');
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await reader.waitForInteraction();
        menu = reader.getSingleControl(menuButton);
        expect(await reader.getMenuActiveDescendantIndex(menu)).to.be(0);
        
        // Check that Home and End keys go to start and end.
        await reader.sendSpecialKey(reader.specialKeys.END);
        await reader.waitForInteraction();
        menu = reader.getSingleControl(menuButton);
        explainTest('After the end key, the selected menu item is the last one');
        expect(await reader.getMenuActiveDescendantIndex(menu)).to.be(menuSize - 1);

        await reader.sendSpecialKey(reader.specialKeys.HOME);
        await reader.waitForInteraction();
        menu = reader.getSingleControl(menuButton);
        explainTest('After the home key, the selected menu item is the first one');
        expect(await reader.getMenuActiveDescendantIndex(menu)).to.be(0);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Space should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the space key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Enter should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ENTER);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the enter key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Down arrow should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the down key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Escape key again should not open the menu again.
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;
        await reader.waitForInteraction();
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');

        explainTest('The menu is still closed after escape key was pressed twice');
        expect(ariaExpanded).to.be('false');

        // Up arrow should open the menu and select the last item..
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the up key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        explainTest('After the up key, the selected menu item is the last one');
        expect(await reader.getMenuActiveDescendantIndex(menu)).to.be(menuSize - 1);

        if (search) {
            menuItems = await reader.findAll(menu, 'menuItem');
            searchMenuItemLabel = reader.getAccessibleName(menuItems[0]);
            await reader.sendKey(searchMenuItemLabel[0]);
            await reader.waitForInteraction();

            explainTest('After searching, the selected menu item is the first menu item');
            expect(await reader.getMenuActiveDescendantIndex(menu)).to.be(0);

            if (menuItems.length > 1) {
                searchMenuItemLabel = reader.getAccessibleName(menuItems[1]);
                await reader.sendKey(searchMenuItemLabel[0]);
                await reader.waitForInteraction();

                explainTest('After searching, the selected menu item is the second menu item');
                expect(await reader.getMenuActiveDescendantIndex(menu)).to.be(1);
            }
        }

        // Finish with a closed menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        return true;
    };


    /**
     * Check labels and keyboard navigation for a menu of links.
     * Throws an error if the validation fails.
     *
     * @method validateMenuButtonLinks
     * @param {String} role The expected role of the menu button to validate.
     * @param {String} label The expected label text of the menu button to validate.
     * @param {Boolean} search Check searching of menu entries.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateMenuButtonLinks = async function(role, label, search = false) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-links.html
        let menuButton,
            ariaExpanded,
            menu,
            menuItems,
            i,
            done,
            menuSize,
            searchMenuItemLabel;

        menuButton = await reader.findInPage(role, label);

        explainTest('The menu button can be found with role: "' + role + '" and label: "' + label + '"');
        expect(reader.isEmpty(menuButton)).to.be(false);

        await reader.focus(menuButton);

        // Check the menu is closed until we act on the button.
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');

        explainTest('The menu is initially closed');
        expect(ariaExpanded).to.be('false');

        // First we will action the button
        await reader.waitForInteraction(true);
        await reader.doDefault(menuButton);
        await reader.waitForInteraction(true);

        // Now the menu should be expanded.
        ariaExpanded = reader.getAttributeValue(menuButton, 'aria-expanded');
        explainTest('The menu is expanded when the button is actioned');
        expect(ariaExpanded).to.be('true');
        
        // The menu should now be findable from aria-controls.
        menu = reader.getSingleControl(menuButton);

        // The role of the menu should be "menu"
        explainTest('The menu is visible');
        expect(reader.isVisible(menu)).to.be(true);
        explainTest('The menu has the correct role (menu)');
        expect(reader.getRole(menu)).to.be("menu");

        menuItems = await reader.findAll(menu, 'menuItem');

        explainTest('The menu has menu entries');
        expect(menuItems.length).not.to.be(0);
        explainTest('The menu entries have unique labels');
        await reader.expectUniqueLabels(menuItems);
        menuSize = menuItems.length;

        // Use the down arrow key to navigate through all the menu items.
        for (i = 0; i < menuItems.length - 1; i++) {
            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i);
            done = reader.waitForFocusChange(menu);
            await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
            await done;
            explainTest('After the down key, the currently selected menu item is ' + (i + 1));
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i + 1);
        }
        // Press the up arrow to move back.
        for (i = menuItems.length - 1; i > 0; i--) {
            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i);
            done = reader.waitForFocusChange(menu);
            await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
            await done;
            explainTest('After the up key, the currently selected menu item is ' + (i - 1));
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i - 1);
        }
        // Check that now up and down wrap around the menu.
        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await done;
        await reader.pause(3000);
        menu = reader.getSingleControl(menuButton);
        explainTest('After the up key, the selected menu item is the last one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        explainTest('After the down key, the selected menu item is the first one');
        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        expect(await reader.getSelectedMenuIndex(menu)).to.be(0);
        
        // Check that Home and End keys go to start and end.
        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.END);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the end key, the selected menu item is the last one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the home key, the selected menu item is the first one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(0);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Space should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the space key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Enter should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ENTER);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the enter key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Down arrow should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the down key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Escape key again should not open the menu again.
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;
        await reader.waitForInteraction();
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');

        explainTest('The menu is still closed after escape key was pressed twice');
        expect(ariaExpanded).to.be('false');

        // Up arrow should open the menu and select the last item..
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the up key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        explainTest('After the up key, the selected menu item is the last one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        if (search) {
            menuItems = await reader.findAll(menu, 'menuItem');
            searchMenuItemLabel = reader.getAccessibleName(menuItems[0]);
            done = reader.waitForFocusChange(menu);
            await reader.sendKey(searchMenuItemLabel[0]);
            await done;
            // Delay for focus stuff.
            await reader.waitForInteraction();

            explainTest('After searching, the selected menu item is the first menu item');
            expect(await reader.getSelectedMenuIndex(menu)).to.be(0);

            if (menuItems.length > 1) {
                searchMenuItemLabel = reader.getAccessibleName(menuItems[1]);
                done = reader.waitForFocusChange(menu);
                await reader.sendKey(searchMenuItemLabel[0]);
                await done;
                // Delay for focus stuff.
                await reader.waitForInteraction();

                explainTest('After searching, the selected menu item is the second menu item');
                expect(await reader.getSelectedMenuIndex(menu)).to.be(1);
            }
        }

        // Finish with a closed menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        return true;
    };

    /**
     * Check labels and accessibility of links displayed in a breadcrumb trail of links.
     * Throws an error if the validation fails.
     *
     * @method validateBreadcrumb
     * @param {String} label The expected label text of the breadcrumb to validate.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateBreadcrumb = async function(label) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/breadcrumb/index.html
        let navigation,
            list,
            listItems,
            listItem,
            navLink,
            currentCount = 0,
            lastCurrent = false,
            ariaCurrent,
            pageUrl,
            samePageUrl,
            links = [];

        navigation = await reader.findInPage("navigation", label);

        // We should have found the navigation node.
        explainTest('The breadcrumbs can be found with role: "navigation" and label: "' + label + '"');
        expect(reader.isEmpty(navigation)).to.be(false);

        // We should have an ordered list.
        list = await reader.getChild(navigation, 'list');
        explainTest('The breadcrumbs contain a list');
        expect(reader.isEmpty(list)).to.be(false);

        listItems = await reader.getChildren(list, 'listItem');

        // Verify we have some entries in the list.
        explainTest('The list of breadcrumbs is not empty');
        expect(listItems).not.to.be.empty();
        // Get the url of the current page.
        pageUrl = await reader.getPageUrl();

        // For each entry in the list.
        for (i = 0; i < listItems.length; i++) {
            listItem = listItems[i];
            // See if it contains a link.
            navLink = await reader.find(listItem, 'link');
            if (navLink) {
                links.push(navLink);
                // See if it the current page.
                ariaCurrent = reader.getAttributeValue(navLink, 'aria-current');
                if (ariaCurrent == 'page') {
                    currentCount += 1;
                    lastCurrent = true;
                } else {
                    lastCurrent = false;
                }
            } else {
                lastCurrent = false;
            }
        }
        explainTest('Each breadcrumb has a unique label');
        await reader.expectUniqueLabels(links);

        // Verify only the last link in the breadcrumbs was marked as the current page.
        explainTest('The last link in the breadcrumbs has represents the current page');
        expect(lastCurrent).to.be(true);
        // Verify there was only one current page in the breadcrumbs.
        explainTest('There was only one current page in the list of breadcrumbs');
        expect(currentCount).to.be(1);

        // Follow the last link.
        await reader.doDefault(navLink);

        // Get the new page Url and verify it is the same page we were already on.
        samePageUrl = await reader.getPageUrl();
        explainTest('Following the last link in the breadcrumbs led to the same page');
        expect(pageUrl).to.be(samePageUrl);

        return true;
    };

    /**
     * Check a modal dialog opened from a button.
     *
     * @method validateModalDialog
     * @param {String} triggerLabel The name of the button to open the dialog
     * @param {String} cancelLabel The name of the button to cancel the dialog
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateModalDialog = async function(triggerLabel, cancelLabel) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/dialog-modal/dialog.html
        let trigger, done, modal, cancel;

        explainTest('Open the dialog');
        trigger = await reader.findInPage('button', triggerLabel);
        done = reader.waitForDialog();
        await reader.doDefault(trigger);
        modal = await done;
        expect(reader.isModal(modal)).to.be(true);
        expect(reader.getAccessibleName(modal)).to.not.be('');

        explainTest('Close it with the cancel button');
        done = reader.waitForHideDialog();
        cancel = await reader.find(modal, 'button', cancelLabel);
        await reader.doDefault(cancel);
        await done;

        explainTest('Open it again');
        trigger = await reader.findInPage('button', triggerLabel);
        done = reader.waitForDialog();
        await reader.doDefault(trigger);
        modal = await done;
        expect(reader.isModal(modal)).to.be(true);
        expect(reader.getAccessibleName(modal)).to.not.be('');

        explainTest('Close it with the escape key');
        cancel = await reader.find(modal, 'button', cancelLabel);

        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);

        explainTest('Dialog should not be visible');
        modal = await reader.findInPage('dialog', '');
        if (!reader.isEmpty(modal)) {
            expect(reader.isVisible(modal)).to.be(false);
        }

    };

    /**
     * Check an alert dialog opened from a button.
     *
     * @method validateAlertDialog
     * @param {String} triggerLabel The name of the button to open the dialog
     * @param {String} cancelLabel The name of the button to cancel the dialog
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateAlertDialog = async function(triggerLabel, cancelLabel) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/dialog-modal/alertdialog.html
        let trigger, done, modal, cancel;

        explainTest('Open the dialog');
        trigger = await reader.findInPage('button', triggerLabel);
        done = reader.waitForAlertDialog();
        await reader.doDefault(trigger);
        modal = await done;
        expect(reader.isModal(modal)).to.be(true);
        expect(reader.getAccessibleName(modal)).to.not.be('');

        explainTest('Close it with the cancel button');
        done = reader.waitForHideAlertDialog();
        cancel = await reader.find(modal, 'button', cancelLabel);
        await reader.doDefault(cancel);
        await done;

        explainTest('Open it again');
        trigger = await reader.findInPage('button', triggerLabel);
        done = reader.waitForAlertDialog();
        await reader.doDefault(trigger);
        modal = await done;
        expect(reader.isModal(modal)).to.be(true);
        expect(reader.getAccessibleName(modal)).to.not.be('');

        explainTest('Close it with the escape key');
        cancel = await reader.find(modal, 'button', cancelLabel);

        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);

        explainTest('Dialog should not be visible');
        modal = await reader.findInPage('alertdialog', '');
        if (!reader.isEmpty(modal)) {
            expect(reader.isVisible(modal)).to.be(false);
        }
    };

    /**
     * Check labels and accessibility of list of expandable regions.
     *
     * @method validateAccordion
     * @param {NodeWrapper} The node that represents the title of the accordion.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateAccordion = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/accordion/accordion.html
        let first,
            last,
            next,
            region,
            button,
            all = [];

        first = reader.next(wrapper, "heading", "");
        explainTest('The accordion has at least one expandable region');
        expect(reader.isEmpty(first)).to.be(false);
        last = first;
        all.push(first);

        next = reader.next(last, "heading", "");
        while (!reader.isEmpty(next)) {
            last = next;
            all.push(next);
            next = reader.next(next, "heading", "");
        }

        await reader.expectUniqueLabels(all);

        // Expand the first section.
        button = reader.next(first, "button", "");
        reader.focus(button);
        explainTest('The accordion heading has a button');
        expect(reader.isEmpty(button)).to.be(false);

        if (!reader.isExpanded(button)) {
            explainTest('We can expand the first region');
            done = reader.waitForNodeExpanded(button);
            await reader.sendSpecialKey(reader.specialKeys.ENTER);
            await done;
        }

        region = reader.getSingleControl(button);
        explainTest('The first button controls a visible region');
        expect(reader.isVisible(region)).to.be(true);
        
        next = reader.next(first, "heading", "");
        while (!reader.isEmpty(next)) {
            // Down moves to the next header.
            await reader.waitForInteraction();
            await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
            button = reader.next(next, "button", "");

            explainTest('The accordion heading has a button');
            expect(reader.isEmpty(button)).to.be(false);

            explainTest('The next region is not expanded');
            expect(reader.isExpanded(button)).to.be(false);

            explainTest('Space expands the region');
            await reader.waitForInteraction();
            reader.focus(button);
            done = reader.waitForNodeExpanded(button);
            await reader.doDefault(button);
            await done;

            explainTest('The button is now expanded');
            expect(reader.isExpanded(button)).to.be(true);
            expect(reader.getAttributeValue(button, 'aria-disabled')).to.be('true');
            region = reader.getSingleControl(button);
            explainTest('The button controls a visible region');
            expect(reader.isVisible(region)).to.be(true);
            explainTest('The region has a label');
            expect(reader.getAccessibleName(region)).not.to.be('');

            next = reader.next(next, "heading", "");
        }
        
        explainTest('The home key focuses on the first entry');
        done = reader.waitForFocusChange(first);
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        await done;
        
        explainTest('The end key focuses on the first entry');
        done = reader.waitForFocusChange(last);
        await reader.sendSpecialKey(reader.specialKeys.END);
        await done;
    };

    /**
     * Check labels and keyboard navigation for a group of radio buttons.
     * Throws an error if the validation fails.
     *
     * @method validateRadioGroup
     * @param {String} role The expected role of the menu button to validate.
     * @param {String} label The expected label text of the menu button to validate.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateRadioGroup = async function(role, label) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-links.html
        let radioGroup,
            options,
            checkedIndex;

        radioGroup = await reader.findInPage(role, label);

        explainTest('The radio group can be found with role: "' + role + '" and label: "' + label + '"');
        expect(reader.isEmpty(radioGroup)).to.be(false);

        await reader.focus(radioGroup);

        options = await reader.findAll(radioGroup, 'radioButton');
        explainTest('The radio group has options');
        expect(options.length).not.to.be(0);
        
        let examineOptions = async function(options, reader, checkCount) {
            let countChecked = 0,
                checkedIndex = -1,
                checked = false,
                option;
            
            for (i = 0; i < options.length; i++) {
                option = options[i];
                checked = await reader.getAttributeValue(option, 'aria-checked');
                if (checked == 'true') {
                    checkedIndex = i;
                    countChecked++;
                }
            }
            if (checkCount) {
                explainTest('There should be only one radio option checked');
                expect(countChecked).to.be(1);
            }
            return checkedIndex;
        }
        checkedIndex = await examineOptions(options, reader, false);
        if (checkedIndex == -1) {
            await reader.focus(options[0]);
            await reader.waitForInteraction(true);
            await reader.sendSpecialKey(reader.specialKeys.ENTER);
        }
        checkedIndex = await examineOptions(options, reader, true);
        while (checkedIndex < (options.length - 1)) {
            await reader.sendSpecialKey(reader.specialKeys.RIGHT_ARROW);
            checkedIndex = await examineOptions(options, reader, true);
        }
        // One more - should wrap.
        await reader.sendSpecialKey(reader.specialKeys.RIGHT_ARROW);
        checkedIndex = await examineOptions(options, reader, true);
        explainTest('Focus should have wrapped to the start');
        expect(checkedIndex).to.be(0);
        
        // Now go back
        await reader.sendSpecialKey(reader.specialKeys.LEFT_ARROW);
        checkedIndex = await examineOptions(options, reader, true);
        explainTest('Focus should have wrapped to the end');
        expect(checkedIndex).to.be(options.length - 1);
        
        while (checkedIndex > 0) {
            await reader.sendSpecialKey(reader.specialKeys.LEFT_ARROW);
            checkedIndex = await examineOptions(options, reader, true);
        }
        while (checkedIndex < (options.length - 1)) {
            await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
            checkedIndex = await examineOptions(options, reader, true);
        }
        while (checkedIndex > 0) {
            await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
            checkedIndex = await examineOptions(options, reader, true);
        }

        return true;
    };

    /**
     * Check labels and keyboard navigation for a group of radio buttons.
     * Throws an error if the validation fails.
     *
     * @method validateRadioGroupActiveDescendant
     * @param {String} role The expected role of the menu button to validate.
     * @param {String} label The expected label text of the menu button to validate.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateRadioGroupActiveDescendant = async function(role, label) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-links.html
        let radioGroup,
            options,
            checkedIndex;

        radioGroup = await reader.findInPage(role, label);

        explainTest('The radio group can be found with role: "' + role + '" and label: "' + label + '"');
        expect(reader.isEmpty(radioGroup)).to.be(false);

        await reader.focus(radioGroup);

        options = await reader.findAll(radioGroup, 'radioButton');
        explainTest('The radio group has options');
        expect(options.length).not.to.be(0);
        
        let examineOptions = async function(radioGroup, options, reader, checkCount) {
            let countChecked = 0,
                checkedIndex = -1,
                checked = false,
                option,
                active,
                activeId,
                currentId;

            active = await reader.getActiveDescendant(radioGroup);
            activeId = await reader.getAttributeValue(active, 'id');
            
            for (i = 0; i < options.length; i++) {
                option = options[i];
                checked = await reader.getAttributeValue(option, 'aria-checked');
                if (checked == 'true') {
                    checkedIndex = i;
                    countChecked++;
                    currentId = await reader.getAttributeValue(option, 'id');
                    expect(activeId).to.be(currentId);
                }
            }
            if (checkCount) {
                explainTest('There should be only one radio option checked');
                expect(countChecked).to.be(1);
            }
            return checkedIndex;
        }
        checkedIndex = await examineOptions(radioGroup, options, reader, false);
        if (checkedIndex == -1) {
            explainTest('We should be able to choose an option.');
            await reader.focus(radioGroup);
            await reader.waitForInteraction(true);
            await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        }
        explainTest('We start with one option selected');
        checkedIndex = await examineOptions(radioGroup, options, reader, true);
        while (checkedIndex < (options.length - 1)) {
            explainTest('Right arrow should select the next option');
            await reader.sendSpecialKey(reader.specialKeys.RIGHT_ARROW);
            checkedIndex = await examineOptions(radioGroup, options, reader, true);
        }
        // One more - should wrap.
        explainTest('Right arrow should wrap to the start');
        await reader.sendSpecialKey(reader.specialKeys.RIGHT_ARROW);
        checkedIndex = await examineOptions(radioGroup, options, reader, true);
        expect(checkedIndex).to.be(0);
        
        // Now go back
        explainTest('Left arrow should wrap to the end');
        await reader.sendSpecialKey(reader.specialKeys.LEFT_ARROW);
        checkedIndex = await examineOptions(radioGroup, options, reader, true);
        expect(checkedIndex).to.be(options.length - 1);
        
        while (checkedIndex > 0) {
            explainTest('Left arrow should select the previous option');
            await reader.sendSpecialKey(reader.specialKeys.LEFT_ARROW);
            checkedIndex = await examineOptions(radioGroup, options, reader, true);
        }
        while (checkedIndex < (options.length - 1)) {
            explainTest('Down arrow should select the next option');
            await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
            checkedIndex = await examineOptions(radioGroup, options, reader, true);
        }
        while (checkedIndex > 0) {
            explainTest('Up arrow should select the previous option');
            await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
            checkedIndex = await examineOptions(radioGroup, options, reader, true);
        }

        return true;
    };

    // Export this class.
    window.WAI = WAI;
}());
