import { IWebComponents } from "ns/typings/schw";
import { addDisposableEventListener } from "ns/common/domListener";
import { WebMainInstance } from "ns/components/root/root";
import { LinksManagerSystem } from "ns/dom/links/linksManager";
import { MainRoutes } from "ns/base/Router/Router"

export function _navigateToBasePage() {
    const __activeRouteLink = document.querySelector(".active-link");
    __activeRouteLink!.classList.remove("active-link");

    const __incomingRouterLink = document.querySelector("#Home-nav-control a")! as HTMLDivElement
    __incomingRouterLink.classList.add("active-link");

    WebMainInstance.FrameRouter.NavigateToRoute("home", { data: "" });
}
export function _navigateToAcademicsPage() {
    const __activeRouteLink = document.querySelector(".active-link");
    __activeRouteLink!.classList.remove("active-link");

    const __incomingRouterLink = document.querySelector("#academics-nav-control a")! as HTMLDivElement
    __incomingRouterLink.classList.add("active-link");

    WebMainInstance.FrameRouter.NavigateToRoute("academics", { data: "" });
}
export function _navigateToAboutusPage() {
    const __activeRouteLink = document.querySelector(".active-link");
    __activeRouteLink!.classList.remove("active-link");

    const __incomingRouterLink = document.querySelector("#about-nav-control a")! as HTMLDivElement
    __incomingRouterLink.classList.add("active-link");

    WebMainInstance.FrameRouter.NavigateToRoute("about", { data: "" });
}





const Template_ = document.createElement('template');

Template_.innerHTML = `

    
<div class="wx-component-header-section" role="heading">
    <div class="wx-header-component-area">
        <div class="wx-badge-wrapper">
            <div id="badge-icon"></div>
            <div class="badge-title">Ndejje Senior Secondary School</div>
        </div>

        <div class="wx-navigation-bar-half-area">
            <div class="navigation-bar-wrapper">
                <div class="main-navigation-bar">
                    <ul class="navigation-items">
                        <li id="Home-nav-control">
                            <a class="active-link" href="#home">Home</a>
                        </li>
                        <li id="blog-nav-control">
                            <a href="#blog" >Blog</a>
                        </li>
                        <li id="about-nav-control">
                            <a href="#about">About us</a>
                        </li>
                        <li id="academics-nav-control">
                            <a href="#academics">Academics</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="accord-options">
            <div class="control-options">
                <div class="facebook-link" title="Join us On Facebook">
                    <span class="material-icons">face</span>
                </div>

                <div class="instagram-link" title="Follow us on Instagram">
                    <div class="cr-icon-wrapper cr-instagram"></div>
                </div>

                <div class="twitter-link" title="Follow us on Twitter">
                    <div class="cr-icon-wrapper cr-twitter"></div>
                </div>
                <div class="theme-manager" title="Change theme">
                    <i class="fa-solid fa-lightbulb"></i>
                </div>
        </div>
    </div>
</div>
</div>

`




export class HeaderComponent extends HTMLElement implements IWebComponents {

    /**
     * Get neccessary elements
     */
    private _HeaderComponent: HTMLDivElement | null = null;
    private _badgeIcon: HTMLDivElement | null = null;

    //links
    private _homeNavControl: HTMLDivElement | null = null;
    private _blogNavControl: HTMLDivElement | null = null;
    private _aboutNavControl: HTMLDivElement | null = null;;
    private _academicsNavControl: HTMLDivElement | null = null;

    //control options
    private _facebook_link: HTMLDivElement | null = null;
    private _instagram_link: HTMLDivElement | null = null;
    private _twitter_link: HTMLDivElement | null = null;
    private _themeChanger_link: HTMLDivElement | null = null;



    //event listener bindings
    /**
     * Social Links event listeners
     */



    constructor() {
        super();
        this.appendChild(Template_.content.cloneNode(true))
    }
    connectedCallback() {
        this.initializeHeaderComponent();
    }
    initializeHeaderComponent() {
        this.attachNeccessaryElementHandles();
        this.attachEventListenersToElements();6
        this._attachSocialLinkksSystem();
        this._navigationRouteListenerSubscriber()
    }

    attachNeccessaryElementHandles() {
        this._badgeIcon = this.getElement("badge-icon");
        this._homeNavControl = this.getElement("Home-nav-control");
        this._blogNavControl = this.getElement("blog-nav-control");
        this._aboutNavControl = this.getElement("about-nav-control");
        this._academicsNavControl = this.getElement("academics-nav-control")
        this._HeaderComponent = this.querySelector(".wx-component-header-section");

        this._facebook_link = this.querySelector(".facebook-link");
        this._instagram_link = this.querySelector(".instagram-link");
        this._twitter_link = this.querySelector(".twitter-link");
        this._themeChanger_link = this.querySelector(".theme-manager");


    };

    attachEventListenersToElements() {
        
        
        if (this._badgeIcon && this._homeNavControl && this._blogNavControl && this._aboutNavControl && this._academicsNavControl) {
            addDisposableEventListener(this._badgeIcon, "click", _navigateToBasePage)
            addDisposableEventListener(this._homeNavControl, "click", _navigateToBasePage);
            addDisposableEventListener(this._blogNavControl, "click", this._navigateToBlogView.bind(this));
            addDisposableEventListener(this._aboutNavControl, "click", this._navigateToAboutView.bind(this));
            addDisposableEventListener(this._academicsNavControl, "click", this._navigateToAcademicsView.bind(this))
        }

    };

    _attachSocialLinkksSystem() {
        if (this._facebook_link && this._instagram_link && this._twitter_link) {
            //click event listeners
            addDisposableEventListener(this._facebook_link, "click", this.__linkFaceBook.bind(this));
            addDisposableEventListener(this._instagram_link, "click", this.__linkInstagram.bind(this));
            addDisposableEventListener(this._twitter_link, "click", this.__linkTwitter.bind(this));
        }
    };

    __linkFaceBook() {
        LinksManagerSystem.LinkToFaceBook()
    }
    __linkInstagram() {
        LinksManagerSystem.LinkToInstagram();
    }
    __linkTwitter() {
        LinksManagerSystem.LinkToTwitter()
    }



    _navigationRouteListenerSubscriber() {
        WebMainInstance.FrameRouter.didNavigateToRouteEventManager.subscribe(this._listenerForNavigationRouteChange.bind(this))
    }

    _listenerForNavigationRouteChange(route: MainRoutes) {
        this._removeAndReplaceActivityState(route)
    }

    _navigateToBlogView() {
        WebMainInstance.FrameRouter.NavigateToRoute("blog", { data: "" });
    };
    _navigateToAboutView() {
        WebMainInstance.FrameRouter.NavigateToRoute("about", { data: "" });

    };
    _navigateToAcademicsView() {
        WebMainInstance.FrameRouter.NavigateToRoute("academics", { data: "" });

    };

    _setActive(route: MainRoutes) {
        switch (route) {
            case "about":
                this._aboutNavControl!.querySelector("a")!.classList.add("active-link");
                break;

            case "home":
                this._homeNavControl!.querySelector("a")!.classList.add("active-link");
                break;

            case "academics":
                this._academicsNavControl!.querySelector("a")!.classList.add("active-link");
                break;

            case "blog":
                this._blogNavControl!.querySelector("a")!.classList.add("active-link");
                break;
        }
    }
    _removeAndReplaceActivityState(newRoute: MainRoutes) {
        const __activeRouteLink = this.querySelector(".active-link");
        __activeRouteLink!.classList.remove("active-link");

        this._setActive(newRoute)

    }



    getElement(_string: string): HTMLDivElement {
        return this.querySelector(`#${_string}`)! as HTMLDivElement
    }

}

customElements.define("ns-header", HeaderComponent);