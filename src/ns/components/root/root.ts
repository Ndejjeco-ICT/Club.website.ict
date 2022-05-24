import { IWebComponents } from "ns/typings/schw";
import { LifeCycleEvents,Lifecycle} from "ns/common/lifecycle";
import { WebMain} from "ns/base/Web/web.main";



const Template_ = document.createElement("template");
Template_.innerHTML = `
<div id="main-content">
    <ns-header></ns-header>
        <div id="basic-page">
            <div class="home-view page-view" ns-route="inactive" ns-view="home-view">
                <ns-home-view></ns-home-view>
            </div>
            <div class="about-view page-view" ns-route="inactive" ns-view="about-view">
                <ns-about-view></ns-about-view>
            </div>
            <div class="blog-view page-view" ns-route="inactive" ns-view="blog-view">
                <ns-blog-view></ns-blog-view>
            </div>
            <div class="academics-view page-view" ns-route="inactive" ns-view="academics-view">
                <ns-academics-view></ns-academics-view>
            </div>
        </div>
    <ns-footer></ns-footer>
    <div class="ns-sub-components">
        
    </div>
</div>
`
export const WebMainInstance = new WebMain();
export class UIRoot extends HTMLElement implements IWebComponents {

    constructor() {
        super();
        this.appendChild(Template_.content.cloneNode(true))
    }
    connectedCallback() {
        LifeCycleEvents.phase = Lifecycle.Started;
        /**
         * We Can Connect WebMain
         */
        //Create Instance To Have It stay for a longtime;
        WebMainInstance.initResources();
        
    };

}
customElements.define("ns-root", UIRoot);
