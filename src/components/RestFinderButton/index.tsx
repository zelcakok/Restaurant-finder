import React, { PureComponent } from 'react';
import './index.css';
import Main from '..';

class RestFinderButton extends PureComponent<any, {}> {
    private buttonIcon: React.RefObject<HTMLSpanElement>;
    private buttonLabel: React.RefObject<HTMLSpanElement>;
    private handler: Main;

    constructor(props: any) {
        super(props);
        this.handler = props.handler;
        this.buttonIcon = React.createRef();
        this.buttonLabel = React.createRef();
    }

    show = () => {
        this.buttonIcon.current!.style.cssFloat = "left";
        this.buttonIcon.current!.style.margin = "0% 0% 0% 5%";
        setTimeout(() => {
            this.buttonLabel.current!.style.display = "inline";
            this.buttonLabel.current!.classList.remove("fadeOut");
            this.buttonLabel.current!.classList.add("fadeIn");
        }, 250)
    }

    hide = () => {
        this.buttonIcon.current!.style.cssFloat = "none";
        this.buttonIcon.current!.style.margin = "auto";
        this.buttonLabel.current!.style.display = "none";
        this.buttonLabel.current!.classList.remove("fadeIn");
        this.buttonLabel.current!.classList.add("fadeOut");
    }

    onClick = () => {
        this.handler.showForm();
    }

    render() {
        return (
            <div className="button-base" onMouseEnter={this.show} onMouseLeave={this.hide} onClick={this.onClick}>
                <div className="button-button">
                    <span className="material-icons button-icon" ref={this.buttonIcon}>restaurant</span>
                    <span className="button-label" ref={this.buttonLabel}>RestFinder</span>
                </div>
            </div>
        )
    }
}

export default RestFinderButton;