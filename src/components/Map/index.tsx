import React, { PureComponent } from 'react';
import './index.css';

import GoogleAPILoader from './GoogleAPILoader';
import Main from '..';

class Map extends PureComponent<any, {}> {
    private handler: Main;
    private map: any;
    private service: any;
    private request: any;
    private rawList: any[];
    private searchTask: any;

    constructor(props: any) {
        super(props);
        this.handler = props.handler;
        this.rawList = [];
        this.searchTask = null;
    }

    getRawList = () => {
        return this.rawList;
    }

    setRawList = (list: any[]) => {
        this.rawList = [...list];
    }

    getCurrLoc = async () => {
        return new Promise((resolve: any, reject: any) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position: any) => {
                    return resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                }, function () {
                    //error
                    return reject("Error: Can't get the location.");
                });
            } else {
                return reject("Error: Browser doesn't support Geolocation.");
            }
        });
    }


    initMap = async () => {
        let curPos: any = await this.getCurrLoc();
        this.map = new google.maps.Map(document.getElementById("map"), {
            zoom: 15,
            center: curPos
        });
        this.service = new google.maps.places.PlacesService(this.map);

        google.maps.event.addListener(this.map, 'bounds_changed', () => {
            if (this.searchTask !== null)
                clearInterval(this.searchTask);
            this.searchTask = setTimeout(() => {
                let request = {
                    location: curPos,
                    bounds: this.map.getBounds(),
                    type: ['restaurant'],
                    radius: 500
                }
                this.service.nearbySearch(request, this.serviceCallback);
            }, 500);
        })
    }

    search = async () => {
        let curPos: any = await this.getCurrLoc();
        this.request.location = curPos;
        this.service.nearbySearch(this.request, this.serviceCallback);
    }

    parsePriceLevel = (level: number) => {
        switch (level) {
            case 0: return "Free";
            case 1: return "Inexpensive";
            case 2: return "Moderate";
            case 3: return "Expensive";
            case 4: return "Very Expensive";
            default: return "No Record";
        }
    }

    _placeMarker = (pos: any, map: google.maps.Map, place: any) => {
        let details: any = null;
        let marker = new google.maps.Marker({
            position: pos,
            map: map
        });
        marker.addListener('click', async () => {
            this.navToMarker(marker);
            console.log(place.place_id)
            let details: any = await this.getPlaceDetails(place.place_id)
            let avail = this.isRestAvail(details.opening_hours);
            let infoWindow = new google.maps.InfoWindow();
            infoWindow.setContent(
                '<div><strong>' + details.name + '</strong>&nbsp;&nbsp;' +
                '<strong>Rating: ' + details.rating + '</strong><br>' +
                'Address: ' + details.formatted_address + '</br>' +
                'Price level: ' + this.parsePriceLevel(details.price_level) + '<br>' +
                'Available: ' + (avail ? "Yes" : "No") + '</div>'
            );
            infoWindow.open(map, marker);
        })
        return marker;
    }

    navToMarker = (marker: any) => {
        this.map.setCenter(marker.getPosition());
    }

    placeMarker = (result: any) => {
        let pos = result.geometry.location;
        return this._placeMarker(
            { lat: pos.lat(), lng: pos.lng() },
            this.map,
            result
        );
    }

    isRestAvail = (result: any) => {
        if (result)
            return JSON.stringify(result).substr(12, 4) === "true";
        return false;
    }

    getPlaceDetails = (place_id: string) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.service.getDetails({
                    map: this.map,
                    placeId: place_id
                }, (place: any, status: any) => {
                    if (status == google.maps.places.PlacesServiceStatus.OK)
                        resolve(place);
                })
            }, 500);
        })
    }

    buildListItem = (name: string, rating: number, isAvail: boolean) => {
        return (
            <table style={{ tableLayout: "fixed", width: "100%" }}>
                <tbody>
                    <tr>
                        <td style={{ width: "auto" }}><strong>{name}</strong></td>
                        <td><span style={{ marginLeft: "2em" }}>Rating: {rating === -1 ? "?" : rating}</span></td>
                        <td><span style={{ float: "right" }}>Opening: {isAvail ? "Yes" : "No"}</span></td>
                    </tr>
                </tbody>
            </table>
        )
    }

    serviceCallback = async (results: any, status: any) => {
        let restList = [];
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (let i in results) {
                let avail = this.isRestAvail(results[i].opening_hours);
                let rating = results[i].rating ? results[i].rating : -1;
                restList.push(
                    {
                        place_id: results[i].place_id,
                        name: this.buildListItem(results[i].name, rating, avail),
                        rating: rating,
                        isAvail: avail,
                        marker: this.placeMarker(results[i]),
                    }
                );
            }
            this.rawList = [...restList];
            this.handler.fillRestList(restList);
        }
    }

    componentDidMount() {
        GoogleAPILoader.load(this.initMap)
    }

    render() {
        return (
            <div className="map" id="map"></div>
        )
    }
}

export default Map;