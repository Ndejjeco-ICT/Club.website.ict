import { Route } from "ns/base/Router/Route";
import { commonEvents, globalEventEmitter, ICommonEvents, IGlobalEventEmitter } from "ns/common/events"
import { LifeCycleEvents, Lifecycle } from "ns/common/lifecycle"
/**
 * The Router enables navigation within Pages with the use html hashes
 * without the necessisity of actually reloading the page.
 */


/**
 * The Router consist of different lifecycles that takeplace
 * Initializing, Loading, Restored
 */
const enum RouterLifeCycle {

    /**
     * The Router is registering all routes that have been
     * appended to it
     */
    Initializing = 0,
    /**
     * The Router is Loading the Initial Page According to the hash
     * all preload the default home Page of the website.
     */
    Loading = 1,
    /**
     * The Router is completely restored and is now fully stable
     */
    Restored = 2
};


export type MainRoutes = "home" | "about" | "blog" | "academics" | "pagenotfound" | "insights";
type NavigationState = "towards" | "AwayFrom" | "static";


interface IRouteNavigationHookCallbackOptions {
    /**
     * The Data Recieved From The Navigation
     */
    data: any;
    /**
     * The Nature of Navigation.
     */
    navigationState: NavigationState;
}

interface IRouteStack {
    forwardStack: string[];
    backwardStack: string[];
}

/**
 * The Router Options and Parameters.
 */
interface IRouterOptions {

    /**
     * This is a global event thats fired when ever the router
     * is about to experience Navigation.
     * @param callback A callback Method to call before the RouteNavigation
     * Occurs
     */
    BeforeRouteNavigationEvent(callback: Function): void;
    /**
  * This is a global event thats fired when ever the router
  * has experienced Navigation.
  * @param callback A callback Method to call After the RouteNavigation
  * Occurs
  */
    AfterRouteNavigationEvent(callback: Function): void;

    /**
     * The Route Navigation hook attaches a mechanism of accessing the data 
     * that moves across during Navigation.
     * @param RouteId The Id To Attach a Hook On
     * @param callback A Callback Function containing the data across the Navigatin
     */

    RouterNavigationHook(RouteId: MainRoutes, callback: (IROptions: IRouteNavigationHookCallbackOptions) => void): void;

    /**
     * Enables users to Navigate within the Routes.
     * @param RouteId The RouteId Without a Hash
     * @param data Any Data To Send Across to the , to be navigated to Pag
     */
    NavigateToRoute(RouteId: MainRoutes, data: any): void;



    /**
     * Called when navigation to a route takeplaces
     */
    didNavigateToRouteEventManager: IGlobalEventEmitter<MainRoutes>;


};

interface IRouteSnychrnousOptions {
    RouteId: MainRoutes,
    data: any
}

class NSRouterView {
    private _nsRouteViewExchangeCallback: Function | null;
    private _nsExchangeState: number;
    private _nsRouteViewEvents: ICommonEvents<number>;

    constructor() {
        this._nsExchangeState = 0;
        this._nsRouteViewEvents = new commonEvents<number>();
        this._nsRouteViewExchangeCallback = null;
    };



    protected listenForExchangeViewCallbackEvents(callback: (args: number) => void) {
        this._nsRouteViewEvents.addListener("didFireRegisteredExchange", callback)
    }
    protected registerRouteViewExchangeCallback(callback: Function) {
        this._nsRouteViewExchangeCallback = callback;
    };

    private invokeRouteViewExchanageCallback() {
        if (this._nsRouteViewExchangeCallback) {
            this._nsRouteViewExchangeCallback();
            this._nsRouteViewEvents.emit("didFireRegisteredExchange", this._nsExchangeState);
        }
    }


    protected getViewComponent(attribute: string) {
        let _component = document.querySelector(`[ns-view=${attribute}]`)! as HTMLDivElement;
        return _component;
    };
    protected getActiveRouteComponent() {
        let _activeComponent = document.querySelector(`[ns-route=active]`)! as HTMLDivElement;
        return _activeComponent;
    };
    protected toggleRouteExchange(component: HTMLDivElement, initialLoad: boolean) {
        if (initialLoad) {
            this.invokeRouteViewExchanageCallback()
            component.setAttribute("ns-route", "active");
            this.invokeRouteViewExchanageCallback()
        } else {
            let activeRouteComponent = this.getActiveRouteComponent();
            if (activeRouteComponent) {
                this.invokeRouteViewExchanageCallback()
                activeRouteComponent.setAttribute("ns-route", "inactive");
                this.invokeRouteViewExchanageCallback()
                component.setAttribute("ns-route", "active");
            } else {
                this.invokeRouteViewExchanageCallback()
                this.invokeRouteViewExchanageCallback()
                component.setAttribute("ns-route", "active");

            }


        }
    }
};

export class NSRouter extends NSRouterView implements IRouterOptions {
    private _nsRouterAfterNavigationCallback: Function | null;
    private _nsRouterBeforeNavigationCallback: Function | null;
    private _nsRouterLifeCycle: RouterLifeCycle;
    private _nsRouteStorage: Map<string, string>;
    private _nsRouteErrorHandler: ((e: string) => void) | null;
    private _nsRoutesArray: Route[];
    private _nsRouteNavigationHooks: Map<MainRoutes, (IROptions: IRouteNavigationHookCallbackOptions) => void>;
    private _nsRouteNavigationState: NavigationState;
    private _nsCurrrentRoute: MainRoutes;
    private _nsStack: IRouteStack;


    didNavigateToRouteEventManager: IGlobalEventEmitter<MainRoutes>

    constructor(ROutes: Route[]) {
        super();
        this._nsStack = { backwardStack: [], forwardStack: [] };
        this._nsCurrrentRoute = "home";
        this._nsRouteNavigationState = "static";
        this._nsRouterAfterNavigationCallback = null;
        this._nsRouterBeforeNavigationCallback = null;
        this._nsRouteErrorHandler = null;
        this._nsRouterLifeCycle = RouterLifeCycle.Initializing;
        this._nsRouteNavigationHooks = new Map<MainRoutes, (IROptions: IRouteNavigationHookCallbackOptions) => void>();
        this._nsRouteStorage = new Map<string, string>();
        this._nsRoutesArray = ROutes;
        this.didNavigateToRouteEventManager = new globalEventEmitter()
        this.registerForLifecyclEvents()

    };


    private _dispatchForEventForRouteChange(route: MainRoutes) {
        this.didNavigateToRouteEventManager.raiseEvent(route)
    }



    private registerForLifecyclEvents() {
        LifeCycleEvents.onPhaseDidChange.subscribe(this._listenerForLifecyclEvents.bind(this));
    };
    private _listenerForLifecyclEvents(phase: Lifecycle) {
        if (phase == Lifecycle.Restored) {
            this.nsRouteInitialization();
        }
        LifeCycleEvents.onPhaseDidChange.unsubscribe(this._listenerForLifecyclEvents.bind(this));
        

    }
    private nsRouteInitialization() {
        this._createStorageFoundationForAllRoutes();
        this.listenerForNsExchangeEvent();

        this._nsRouterLifeCycle = RouterLifeCycle.Loading;
        this._loadContentOFPage();

        this._nsRouterLifeCycle = RouterLifeCycle.Restored;
        this._registerEventListenerForHashDidChange();
        LifeCycleEvents.phase = Lifecycle.Ready;


    }
    BeforeRouteNavigationEvent(callback: Function): void {
        if (this._nsRouterBeforeNavigationCallback == null) {
            this._nsRouterBeforeNavigationCallback = callback;
        }
    }
    AfterRouteNavigationEvent(callback: Function): void {
        if (this._nsRouterAfterNavigationCallback == null) {
            this._nsRouterAfterNavigationCallback = callback;
        }
    }
    RouterNavigationHook(RouteId: MainRoutes, callback: (IROptions: IRouteNavigationHookCallbackOptions) => void): void {
        if (!this._nsRouteNavigationHooks.has(RouteId)) {
            this._nsRouteNavigationHooks.set(RouteId, callback);
        }
    }
    NavigateToRoute(RouteId: MainRoutes, data: any): void {
        if (this.isHashPresent(RouteId)) {
            this._setLocationHash(RouteId);
            this._nsCurrrentRoute = RouteId;
        }else{
            this._setLocationHash("pagenotfound")
        }
    };


    listenerForNsExchangeEvent() {
        //Initial Load;
        this.reCreateNavigationExchangeCall("Before")
        this.listenForExchangeViewCallbackEvents((args: number) => {
            if (args == 0) {
                this.reCreateNavigationExchangeCall("After");
            }
        })
    }

    reCreateNavigationExchangeCall(state: "Before" | "After") {
        if (state == "Before") {
            this.registerRouteViewExchangeCallback(this.BeforeRouteNavigationEvent.bind(this));
        } else if (state == "After" && this._nsRouterAfterNavigationCallback) {
            this.registerRouteViewExchangeCallback(this.AfterRouteNavigationEvent.bind(this))
        }

    }

 

    private _setLocationHash(routeid: MainRoutes) {
        window.location.hash = routeid;
    }

    private _registerEventListenerForHashDidChange() {
        window.addEventListener("hashchange", this.listenerForHashDidChange.bind(this));
    };
    private listenerForHashDidChange(ev: HashChangeEvent) {
        this._loadContentOFPage();
    }

    private _readCurrentAvailablHash() {
        let _hash = window.location.hash;
        return _hash.substring(1);
    };

    private _loadContentOFPage() {
        let _currentHashTitle = this._readCurrentAvailablHash();
        if (_currentHashTitle == "") {
            let _viewAttribute = this.getViewAttriubte("home");
            this.toggleRouteExchange(this.getViewComponent(_viewAttribute), true)
            this._dispatchForEventForRouteChange("home")
        } else {
            if (this.isHashPresent(_currentHashTitle)) {
                let _viewAttribute = this.getViewAttriubte(_currentHashTitle);
                this._dispatchForEventForRouteChange(_currentHashTitle! as unknown as MainRoutes)
                this.toggleRouteExchange(this.getViewComponent(_viewAttribute), false)

            }
        }


    }
    private getViewAttriubte(hashTitle: string) {
        let __hash__ = "/" + hashTitle;
        return this._nsRouteStorage.get(__hash__)!;
    }
    private isHashPresent(hash: string) {
        let __hash__ = "/" + hash;
        if (this._nsRouteStorage.has(__hash__)) {
            return true;
        } else {
            return false;
        }
    }

    private _createStorageFoundationForAllRoutes() {
        for (let i = 0; i < this._nsRoutesArray.length; i++) {
            if (!this._nsRouteStorage.has(this._nsRoutesArray[i].routeLocation)) {
                this._nsRouteStorage.set(this._nsRoutesArray[i].routeLocation, this._nsRoutesArray[i].routeViewAttribute);
            }
        }
    }


};

