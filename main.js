function resetScroll(){
    if(window.innerWidth <= 700){
        window.scrollTo(0,775);
    } else {
        window.scrollTo(0,0);
    }
}

class Page {
    path = location.pathname

    constructor() {
        pageChanger.add(this) // add this page to navigation
        this.init()
    }

    init(){
        console.warn("init() needs to be a part of: "+this)
    }
}

class PageChanger {
    domainName = location.origin
    loadedScripts = []
    loadedPageScripts = []


    constructor() {
        this.loadInitScripts()
    }


    add(script){
        this.loadedPageScripts.push(script)
    }

    init(){
        this.loadedPageScripts.forEach((page)=>{
            if(location.pathname===page.path){
                page.init()
            }
        })
    }

    loadInitScripts(){
        for (let i = 0; i < document.head.children.length; i++) {
            if(document.head.children[i].nodeName==="SCRIPT" && document.head.children[i].src !== ""){
                this.loadedScripts.push(document.head.children[i].src)
            }
        }
        this.setWindowOnPopState()
    }

    setWindowOnPopState(){
        window.onpopstate = () => {
            this.changePage(location.pathname, ()=>{
                history.replaceState(location.pathname,document.title,document.location);
                pageChanger.init()
            })
        };
    }

    changeURL(page){
        history.pushState(page, document.title, page)
        this.setWindowOnPopState()
        this.init()
    }

    changeTo(page){
        if(location.pathname!==page){
            this.changePage(page, ()=>{
                this.changeURL(page)
            })
        }
    }


    changeHead(head){
        // Clear head
        document.head.innerHTML = null
        // Create head children tags manually
        for (let i = 0; i < head.children.length; i++) {
            let duplicate = false
            const isScriptWithSource = (head.children[i].nodeName === "SCRIPT" && head.children[i].src.length>0)
            // Checking for duplicate - Register scripts with src (ensure no duplicates getting loaded)
            if(isScriptWithSource){
                // check for script already loaded
                for (let j = 0; j < this.loadedScripts.length; j++) {
                    if (this.loadedScripts[j] === head.children[i].src){
                        duplicate = true
                        break
                    }
                }
                if(!duplicate){
                    this.loadedScripts.push(head.children[i].src)
                }
            }

            // Also add all head tags to head
            if(!duplicate){
                const node = document.createElement(head.children[i].nodeName)
                // Assign attributes
                for (let j = 0; j < head.children[i].getAttributeNames().length; j++) {
                    const attributeName = head.children[i].getAttributeNames()[j]
                    const attributeValue = head.children[i].getAttribute(attributeName)
                    node.setAttribute(attributeName,attributeValue)
                }
                node.innerHTML = head.children[i].innerHTML
                document.head.append(node)
            }
        }
    }

    changeBody(body){
        document.body.innerHTML = body.innerHTML
    }

    changePage(page, then){
        const request = new Request(this.domainName+page);
        fetch(request).then((response) => {
            return response.text()
        }).then((html) =>  {
            try {
                const parser = new DOMParser();
                html = parser.parseFromString(html, 'text/html');
            } catch(error) {
                console.error("Could not parse html: "+error)
            }
            this.changeHead(html.head)
            this.changeBody(html.body)
            // start from the top of the page
            //window.scrollTo(0, 0);
            resetScroll()
            return then()
        })
    }
}

const pageChanger = new PageChanger()


