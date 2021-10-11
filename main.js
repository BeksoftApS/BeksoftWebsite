class Ajax {
    ajaxPath = null
    asynchronousState = true

    callPage(method, pageLink, HTMLCallback){
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200) {
                let html = xhr.responseText;
                HTMLCallback(html);
            } else if(xhr.readyState == 4 && xhr.status == 0){

            } else {

            }
        }

        this.sendPageRequest(method, pageLink, xhr);
        return xhr;
    }

    sendPageRequest(method, pageLink, xhr){
        if(method.toUpperCase()=="GET"){
            xhr.open(method, pageLink, this.asynchronousState);
            xhr.send();
        } else if(method.toUpperCase()=="POST") {
            xhr.open(method, pageLink, this.asynchronousState);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send();
        }
    }
}

class Link {
    pageLoader;
    pathName = "";

    constructor(){
        this.pageLoader = new PageLoader();
    }


    make(link){
        return this.pathName + link;
    }

    // change the history
    click(link, pushState, page){
        if(pushState){
            // NEW PAGE
            link = this.make(link);
        } else {
            // BACK
        }
        this.pageLoader.loadPage(link, pushState, page);
    }
}

class PageLoader {
    activePageLink;
    activePage;

    handleState(pageLink, pushState, page){
        if(pushState){
            history.pushState(pageLink,document.title,pageLink); // TODO: test if document title works in all browsers
        }

        window.onpopstate = (event) => {
            history.replaceState(event.state,document.title,document.location);
            if(event.state!==null){
                if(page==null){
                    // RESTORE AND PREVENT ERRORS
                    main.link.click(main.link.click('/', true, main.navigation),false, main.navigation);
                } else {
                    main.link.click(event.state,false, page); // event.state is pageName, document.location is pageLink
                }
            }
        };
    }

    loadPage(pageLink, pushState, page){
        this.activePage = main.pageChanger.currentPage;
        main.pageChanger.changeTo(page);
        if(this.activePageLink!==pageLink){
            main.ajax.callPage("GET", pageLink,(html)=>{
                let parser = new DOMParser();
                html = parser.parseFromString(html, 'text/html');
                // parts of Head
                document.title = html.title;
                /*
                let metaData = [
                    "meta[name='description']",
                    "meta[name='keywords']",
                    "meta[name='author']",
                    "meta[name='copyright']",
                    "link[rel='shortcut icon']",
                    "link[rel='apple-touch-icon']"
                ];
                metaData.forEach((metaId)=>{
                    document.querySelector(metaId).outerHTML = html.querySelector(metaId).outerHTML;
                });
                */
                let contentContainer = document.getElementsByClassName("contentContainer")[0];
                contentContainer.innerHTML = html.body.children[2].innerHTML;


                // JavaScript
                // TODO: IF SWITCHING HTML IS NEEDED WE NEED TO REINITIALIZE BECAUSE OF REFERENCES FOR HTML ITEMS
                /*
                try{
                    main.initialize(); // we need to reinitialize as the DOM could be updated, hence we might get reference errors
                } catch (e) {
                    alert("Setup Error: There needs to be a initialize() method in JavaScript. Error was: "+e);
                }
                 */
                // HARDCORE FOR BEKSOFT WEBSITE
                pricesShown = false; // HARDCODE
                resetScroll(); // HARDCODE


                this.activePageLink = pageLink; // important to update the pageLoader of link, as the javascript is initialized
            });
            this.handleState(pageLink, pushState, this.activePage);

        }
    }
}

class PageChanger {
    pages;
    currentPage;
    previousPage;

    constructor(pages) {
        this.pages = pages;
    }

    changeTo(newPage){
        //window.scrollTo(0, 0);

        // change reference of current page
        this.previousPage = this.currentPage;
        this.currentPage = newPage;
    };

}

class Main {
    // SETUP
    ajax = new Ajax();

    // EXTRA SETUP
    link = new Link();
    pageLoader = new PageLoader();

    oversigt = "Oversigt";
    service = "Service";
    produkter = "Produkter";
    omos = "Om os";
    presse = "Presse";
    kontakt = "Kontakt";

    pageChanger = new PageChanger([this.oversigt, this.service, this.produkter, this.omos, this.presse, this.kontakt]);
}
// Action
let activePage = null;

let pricesShown = false;

function togglePrices(){
    if(pricesShown){
        document.getElementById("prices").style.display = "none";
    } else {
        document.getElementById("prices").style.display = "block";
    }
    pricesShown = !pricesShown;
}

function resetScroll(){
    if(window.innerWidth <= 700){
        window.scrollTo(0,775);
    } else {
        window.scrollTo(0,0);
    }
}
let main = null;

document.onreadystatechange = function () {
    if (document.readyState === 'interactive') {

    }
    if (document.readyState === 'complete') {
        main = new Main();
    }
}