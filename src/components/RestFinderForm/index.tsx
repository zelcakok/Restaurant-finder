import React, { PureComponent } from 'react';
import './index.css';
import Main from '..';

interface State {
    restList: []
}

class RestFinderForm extends PureComponent<any, {}> {
    public state: State = {
        restList: []
    }
    private handler: Main;
    private list: React.RefObject<HTMLTextAreaElement>;
    private sort: React.RefObject<HTMLSelectElement>;
    private filter: React.RefObject<HTMLSelectElement>;

    constructor(props: any) {
        super(props);
        this.handler = props.handler;
        this.list = React.createRef();
        this.sort = React.createRef();
        this.filter = React.createRef();
    }

    componentDidMount() {

    }

    fillRestList = (list: any[]) => {
        this.setState({ restList: [] }, () => {
            this.setState({ restList: list })
        })
    }

    onListItemClick = (marker: any) => {
        this.handler.navToMarker(marker);
    }

    buildList = () => {
        if (Object.keys(this.state.restList).length === 0)
            return <div className="error">Processing, please wait...</div>
        let list = [];
        for (let id in this.state.restList) {
            let rest: any = this.state.restList[id];
            list.push(
                <div key={id} onClick={() => this.onListItemClick(rest.marker)}>
                    <label>{rest.name}</label>
                    <input type="checkbox" />
                </div>
            )
        }
        return list;
    }

    onSortChange = () => {
        let val = parseInt(this.sort.current!.value);
        this.handler.setSortBy(val);
    }

    render() {
        return (
            <div className="form-base">
                <div className="form-content">
                    <div className="form-section">
                        <label className="form-title">Restaurants Nearby</label>
                    </div>
                    <div className="form-section form-list">
                        {
                            this.buildList()
                        }
                    </div>
                    <div className="form-section">
                        <table className="form-options">
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="form-section">
                                            <label className="form-subtitle">Sort by:</label>
                                            <select className="selection" ref={this.sort} onChange={this.onSortChange}>
                                                <option value={Main.SORTBY.DISTANCE}>Distance (Ascending)</option>
                                                <option value={Main.SORTBY.TITLE}>Title (Ascending)</option>
                                                <option value={Main.SORTBY.RATING}>Rating (Descending)</option>
                                                <option value={Main.SORTBY.PRICE}>Price (Ascending)</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        )
    }
}

export default RestFinderForm;