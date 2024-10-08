import { Frame } from "not-bulma";
import { notPath } from "not-bulma/src/frame";

const { notBase } = Frame;

const OPT_DEFAULT_PAGE_SIZE = 20,
    OPT_DEFAULT_PAGE_NUMBER = 0,
    OPT_DEFAULT_PAGE_RANGE = 6,
    OPT_DEFAULT_SORT_DIRECTION = 1,
    OPT_DEFAULT_SEARCH = "",
    OPT_DEFAULT_RETURN = {},
    OPT_DEFAULT_COMBINED_ACTION = "listAndCount",
    OPT_DEFAULT_SORT_FIELD = "_id";

/**
	Few concepts
		*	two modes 1 - live requesting from server, 2 - static data

		*	in live mode: changing of filters or sorters leads to another request
			to server, in endless mode after scroll down to the bottom of
			table next page will be requested and glued to the bottom of the
			table, in pagination mode after change of sorter or filter
			pagination will be reset

		*	in static mode: change in filters or sorters will lead to pagination
			reset

	let input = {
		data:	//array of items to be presented in table
				//in case of static - unfiltered
				//in case of live - will be mirrored to table without any changes
		options: {
			pager:{
				size: 50,		//how many rows per "page"
				number: 0,		//default page number aka first
			},
			interface:{			//for online requested list
				factory: 		//target notRecord factory with notRecordInterface, source of online data
				listAction:		//which action will be called to retrieve data from server, default 'list'
				countAction:	//which action will be called to retrieve raws count from server, default 'count'
				combined: 		//cobined request list and count
				combinedAction:	//name of combined action
				onSuccess:		//will be called after successfull request
				onError:		//will be called after failed request
			}
		}
	}
*/

class notFilter extends notBase {
    constructor(input) {
        super(input);
        this.data = {
            pagination: {
                items: {
                    count: 0,
                    from: 0,
                    to: 0,
                },
                pages: {
                    count: 0,
                    from: 0,
                    to: 0,
                    current: 0,
                    list: [],
                },
            },
        };
        if (Object.hasOwn(input.options, "filter")) {
            this.setFilter(Frame.notCommon.copyObj(input.options.filter));
        } else {
            this.resetFilter();
        }
        if (Object.hasOwn(input.options, "pager")) {
            this.setPager(Frame.notCommon.copyObj(input.options.pager));
        } else {
            this.resetPager();
        }
        if (Object.hasOwn(input.options, "sorter")) {
            this.setSorter(Frame.notCommon.copyObj(input.options.sorter));
        } else {
            this.resetSorter();
        }
        if (Object.hasOwn(input.options, "return")) {
            this.setReturn(Frame.notCommon.copyObj(input.options.return));
        } else {
            this.setReturn();
        }
        if (Object.hasOwn(input.options, "search")) {
            this.setSearch(Frame.notCommon.copyObj(input.options.search));
        } else {
            this.setSearch();
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    ////navigation
    ////////////////////////////////////////////////////////////////////////////
    getNext() {
        let next = isNaN(this.getWorking("pager").page)
            ? this.getDefaultPageNumber()
            : this.getWorking("pager").page + 1;
        this.getWorking("pager").page = Math.min(
            next,
            this.data.pagination.pages.to
        );
        return this.loadData();
    }

    getPrev() {
        let prev = isNaN(this.getWorking("pager").page)
            ? this.getDefaultPageNumber()
            : this.getWorking("pager").page - 1;
        this.getWorking("pager").page = Math.max(
            prev,
            this.data.pagination.pages.from
        );
        return this.loadData();
    }

    getFirst() {
        this.getWorking("pager").page = 0;
        return this.loadData();
    }

    getLast() {
        this.getWorking("pager").page = this.data.pagination.pages.count - 1;
        return this.loadData();
    }

    getPage(pageNumber = 0) {
        this.getWorking("pager").page = pageNumber;
        return this.loadData();
    }

    ///////////////////////////////////////////////////////////////////////////
    ////networking
    ///////////////////////////////////////////////////////////////////////////
    getDataInterface() {
        return this.getOptions("interface.factory")({});
    }

    getCombinedActionName() {
        return this.getOptions("interface.combinedAction")
            ? this.getOptions("interface.combinedAction")
            : OPT_DEFAULT_COMBINED_ACTION;
    }

    async loadData() {
        this.emit("loading");
        //load from server
        let query = this.getDataInterface()
                .setFilter(this.getFilter())
                .setSorter(this.getSorter())
                .setReturn(this.getReturn())
                .setSearch(this.getSearch())
                .setPager(this.getPager()),
            actionName = this.getCombinedActionName();
        const result = await query["$" + actionName]()
            .then(this.extractResult.bind(this))
            .then(this.updatePagination.bind(this));
        this.emit("data", result);
        return result;
    }

    extractResult(response) {
        const resultPath = this.getOptions("resultPath", ":");
        if (resultPath) {
            return notPath.get(resultPath, response);
        } else {
            return response;
        }
    }

    updatePagination(result) {
        return new Promise((resolve, reject) => {
            try {
                this.data.pagination.pages.list.splice(
                    0,
                    this.data.pagination.pages.list.length
                );
                let itemsCount = result.count,
                    itemsFrom =
                        (this.getPager().page - OPT_DEFAULT_PAGE_NUMBER) *
                            this.getPager().size +
                        1,
                    pagesCount =
                        itemsCount % this.getPager().size
                            ? Math.floor(itemsCount / this.getPager().size) + 1
                            : Math.round(itemsCount / this.getPager().size),
                    pagesFrom = Math.max(
                        OPT_DEFAULT_PAGE_NUMBER,
                        this.getPager().page - OPT_DEFAULT_PAGE_RANGE
                    ),
                    pagesTo = Math.min(
                        pagesCount - (1 - OPT_DEFAULT_PAGE_NUMBER),
                        this.getPager().page + OPT_DEFAULT_PAGE_RANGE
                    ),
                    list = [],
                    itemsTo = Math.min(
                        itemsFrom + this.getPager().size - 1,
                        itemsCount
                    );
                for (let t = pagesFrom; t <= pagesTo; t++) {
                    list.push({
                        index: t,
                        active: t === this.getPager().page,
                    });
                }
                this.data.pagination.items.count = itemsCount;
                this.data.pagination.items.from = itemsFrom;
                this.data.pagination.items.to = itemsTo;
                this.data.pagination.pages.count = pagesCount;
                this.data.pagination.pages.from = pagesFrom;
                this.data.pagination.pages.to = pagesTo;
                this.data.pagination.pages.current = this.getPager().page;
                this.data.pagination.pages.list.splice(
                    0,
                    this.data.pagination.pages.list.length,
                    ...list
                );
                result.pagination = this.data.pagination;
                resolve(result);
            } catch (e) {
                e.response = result;
                reject(e);
            }
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    ////sorter
    ///////////////////////////////////////////////////////////////////////////
    setSorter(hash) {
        this.setWorking("sorter", hash);
        return this;
    }

    resetSorter() {
        let t = {};
        t[OPT_DEFAULT_SORT_FIELD] = OPT_DEFAULT_SORT_DIRECTION;
        return this.setSorter(t);
    }

    getSorter() {
        return this.getWorking("sorter");
    }

    getSorterDirection() {
        try {
            let names = Object.keys(this.getSorter());
            return this.getSorter()[names[0]];
        } catch {
            return OPT_DEFAULT_SORT_DIRECTION;
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    ////search
    ///////////////////////////////////////////////////////////////////////////
    getSearch() {
        let search =
            typeof this.getWorking("search") !== "undefined" &&
            this.getWorking("search") !== null;
        return search ? this.getWorking("search") : "";
    }

    setSearch(line = OPT_DEFAULT_SEARCH) {
        this.setWorking("search", line);
        return this;
    }

    ///////////////////////////////////////////////////////////////////////////
    ////return
    ///////////////////////////////////////////////////////////////////////////
    getReturn() {
        return this.getWorking("return");
    }

    setReturn(ret = OPT_DEFAULT_RETURN) {
        this.setWorking("return", ret);
        return this;
    }

    ///////////////////////////////////////////////////////////////////////////
    ////filter
    ///////////////////////////////////////////////////////////////////////////
    setFilter(hash) {
        this.setWorking("filter", hash);
        return this;
    }

    resetFilter() {
        return this.setFilter({});
    }

    getFilter() {
        return this.getWorking("filter");
    }

    ///////////////////////////////////////////////////////////////////////////
    ////pager
    ///////////////////////////////////////////////////////////////////////////
    setPager(hash) {
        this.setWorking("pager", hash);
        return this;
    }

    getDefaultPageNumber() {
        return isNaN(this.getOptions("pager.page"))
            ? OPT_DEFAULT_PAGE_NUMBER
            : this.getOptions("pager.page");
    }

    getDefaultPageSize() {
        return isNaN(this.getOptions("pager.size"))
            ? OPT_DEFAULT_PAGE_SIZE
            : this.getOptions("pager.size");
    }

    resetPager() {
        this.setWorking("pager", {
            size: this.getDefaultPageSize(),
            page: this.getDefaultPageNumber(),
        });
        return this;
    }

    getPager() {
        return this.getWorking("pager");
    }
}

export default notFilter;
