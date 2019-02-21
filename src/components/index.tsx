import React, { PureComponent } from 'react';
import './index.css';

import Map from './Map';
import RestFinderButton from './RestFinderButton';
import RestFinderForm from './RestFinderForm';
import { number } from 'prop-types';

enum SORTBY {
    DISTANCE, TITLE, RATING, PRICE
}

interface State {
    sortBy: SORTBY
}

class Main extends PureComponent<any, {}> {
    static SORTBY = SORTBY;

    public state: State = {
        sortBy: SORTBY.DISTANCE
    }
    private isDragStarted: boolean;
    private map: React.RefObject<HTMLDivElement>;
    private form: React.RefObject<HTMLDivElement>;
    private button: React.RefObject<HTMLDivElement>;
    private backdrop: React.RefObject<HTMLInputElement>;

    private restForm: React.RefObject<RestFinderForm>;
    private restMap: React.RefObject<Map>;

    private rawList: any[];

    constructor(props: any) {
        super(props);
        this.isDragStarted = false;
        this.map = React.createRef();
        this.form = React.createRef();
        this.button = React.createRef();
        this.backdrop = React.createRef();

        this.restForm = React.createRef();
        this.restMap = React.createRef();
        this.rawList = [];
    }

    componentDidMount() {
        this.backdrop.current!.addEventListener('mousedown', (e: any) => {
            if (this.form.current!.classList.contains("slideUp"))
                this.hideForm();
        }, true);
    }

    getPlaceDetails = (id: string) => {
        this.restMap.current!.getPlaceDetails(id);
    }

    showForm = () => {
        this.backdrop.current!.checked = true;
        this.button.current!.classList.remove("zoomIn");
        this.button.current!.classList.add("zoomOut");

        this.form.current!.classList.remove("slideDown");
        this.form.current!.classList.add("slideUp");
    }

    hideForm = () => {
        this.backdrop.current!.checked = false;
        this.button.current!.classList.remove("zoomOut");
        this.button.current!.classList.add("zoomIn");

        this.form.current!.classList.remove("slideUp");
        this.form.current!.classList.add("slideDown");
    }

    fillRestList = async (list: any[]) => {
        let sortedList: any[] = [];
        let sortFunc: any = this.getSorting();
        if (sortFunc === this.sortByPrice) {
            sortedList = await this.sortByPrice();
            this.restForm.current!.fillRestList(sortedList);
            return;
        }
        if (sortFunc) sortedList = list.concat().sort(sortFunc);
        else sortedList = this.restMap.current!.getRawList();
        this.restForm.current!.fillRestList(sortedList);
    }

    sortByTitle = (a: any, b: any) => {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    }

    sortByRating = (a: any, b: any) => {
        return a.rating > b.rating ? -1 : a.rating < b.rating ? 1 : 0;
    }

    sortByPrice = async () => {
        this.restForm.current!.setState({ restList: [] });
        let restDetails: any[] = [];
        let restList: any[] = this.restMap.current!.getRawList();
        for (let i in restList) {
            let details: any = await this.restMap.current!.getPlaceDetails(restList[i].place_id);
            let avail = this.restMap.current!.isRestAvail(details.opening_hours);
            let rating = details.rating ? details.rating : -1;
            details.name = this.restMap.current!.buildListItem(
                details.name,
                details.rating,
                avail
            )
            details.marker = restList[i].marker;
            restDetails.push(details);
        }
        this.restMap.current!.setRawList(restDetails);
        restDetails.sort(this._sortByPrice);
        return restDetails;
    }

    _sortByPrice = (a: any, b: any) => {
        if(!a.price_level || !b.price_level) return 1;
        return a.price_level < b.price_level ? -1 : a.price_level > b.price_level ? 1 : 0;
    }

    navToMarker = (marker: any) => {
        this.restMap.current!.navToMarker(marker)
    }

    setSortBy = (sortBy: number) => {
        this.setState({ sortBy: sortBy }, () => this.fillRestList(
            this.restForm.current!.state.restList
        ))
    }

    getSorting = () => {
        switch (this.state.sortBy) {
            case SORTBY.TITLE: return this.sortByTitle;
            case SORTBY.RATING: return this.sortByRating;
            case SORTBY.PRICE: return this.sortByPrice;
            default: return false;
        }
    }

    render() {
        return (
            <div className="app-container" >
                <div className="button-container" ref={this.button}>
                    <RestFinderButton handler={this} />
                </div>
                <div className="map-container" ref={this.map}>
                    <Map handler={this} ref={this.restMap} />
                </div>
                <div className="form-container" ref={this.form}>
                    <RestFinderForm handler={this} ref={this.restForm} />
                </div>
                <input type="checkbox" className="backdrop-container" ref={this.backdrop} />
            </div>
        )
    }
}
export default Main;