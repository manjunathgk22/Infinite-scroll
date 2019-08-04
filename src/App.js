
import './App.scss';

import React, { Component } from 'react'
// import rowElemnt from './component/rowElement';
import Header from './component/Header';
import Sidebar from './component/Sidebar';
const FETCH_URL = 'https://road-cemetery.glitch.me/getData?index=';
export default class App extends Component {
  constructor(){
      super();
      this.state = {
        topSentinelPreviousY: 0,
        topSentinelPreviousRatio: 0,
        bottomSentinelPreviousY: 0,
        bottomSentinelPreviousRatio: 0,
        listSize: 20,
        DB: [],
        currentIndex: 0,
        apiIndex: 1
      }
      
  }
  componentDidMount() {
    fetch( FETCH_URL + this.state.apiIndex)
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          DB: result,
        }, ()=>{
          
          this.initList(this.state.listSize);
          this.initIntersectionObserver();
        });
      },
      (error) => {
      }
    )
    
  }
  
  initList = num => {
    const container = document.querySelector(".list-items");
    
    for (let i = 0; i < num; i++) {
      const tile = document.createElement("LI");
      tile.setAttribute("class", "tile");
      tile.setAttribute("id", "tile-" + i);
      tile.setAttribute("data-id", this.state.DB[i].Counter);
      const title = document.createElement("H3");
      const t = document.createTextNode(this.state.DB[i].title);
      title.appendChild(t);
      tile.appendChild(title);
      const img = document.createElement("IMG");
      img.setAttribute("src", this.state.DB[i].imgSrc);
      tile.appendChild(img);
      container.appendChild(tile);
    }
  }
  getSlidingWindow = isScrollDown => {
    const increment = this.state.listSize / 2;
    let firstIndex;
    
    if (isScrollDown) {
      firstIndex = this.state.currentIndex + increment;
    } else {
      firstIndex = this.state.currentIndex - increment;
    }
    
    if (firstIndex < 0) {
      firstIndex = 0;
    }
    
    return firstIndex;
  }
  recycleDOM = firstIndex => {
    for (let i = 0; i < this.state.listSize; i++) {
      const tile = document.querySelector("#tile-" + i);      
      tile.firstElementChild.innerText = this.state.DB[i + firstIndex].title;
      tile.lastChild.setAttribute("src", this.state.DB[i + firstIndex].imgSrc);
      tile.setAttribute("data-id", this.state.DB[i + firstIndex].Counter);
    }
  }
  getNumFromStyle = numStr => Number(numStr.substring(0, numStr.length - 2));

  adjustPaddings = isScrollDown => {
    const container = document.querySelector(".list-items");
    const currentPaddingTop = this.getNumFromStyle(container.style.paddingTop);
    const currentPaddingBottom = this.getNumFromStyle(container.style.paddingBottom);
    const remPaddingsVal = 170 * (this.state.listSize / 2);
    if (isScrollDown) {
      container.style.paddingTop = currentPaddingTop + remPaddingsVal + "px";
      container.style.paddingBottom = currentPaddingBottom === 0 ? "0px" : currentPaddingBottom - remPaddingsVal + "px";
    } else {
      container.style.paddingBottom = currentPaddingBottom + remPaddingsVal + "px";
      container.style.paddingTop = currentPaddingTop === 0 ? "0px" : currentPaddingTop - remPaddingsVal + "px";
      
    }
  }
  topSentCallback = entry => {
    if (this.state.currentIndex === 0) {
      const container = document.querySelector(".list-items");
      container.style.paddingTop = "0px";
      container.style.paddingBottom = "0px";
    }
  
    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;
  
    // conditional check for Scrolling up
    if (
      currentY > this.state.topSentinelPreviousY &&
      isIntersecting &&
      currentRatio >= this.state.topSentinelPreviousRatio &&
      this.state.currentIndex !== 0
    ) {
      const firstIndex = this.getSlidingWindow(false);
      this.adjustPaddings(false);
      this.recycleDOM(firstIndex);
      this.setState({
        currentIndex: firstIndex
      })
    }
    
    this.setState({
      topSentinelPreviousY : currentY
    });
    this.setState({
      topSentinelPreviousRatio : currentRatio
    });    
    
  }
   botSentCallback = entry => {
    if (this.state.currentIndex === this.state.DB.length - this.state.listSize) {
      return;
    }
    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;
  
    // conditional check for Scrolling down
    if (
      currentY < this.state.bottomSentinelPreviousY &&
      currentRatio > this.state.bottomSentinelPreviousRatio &&
      isIntersecting
    ) {
      const firstIndex = this.getSlidingWindow(true);
      this.adjustPaddings(true);
      this.recycleDOM(firstIndex);
      this.setState({
        currentIndex :firstIndex
      })
      
    }
    this.setState({
      bottomSentinelPreviousY : currentY,
      bottomSentinelPreviousRatio : currentRatio
    })
    
    if(Number.parseInt(entry.target.dataset.id)  > (85 + ((this.state.apiIndex -1) * 100)) ){
      
      this.nextData();
    }
    
  }
  
  initIntersectionObserver = () => {
    const options = {      
    }
  
    const callback = entries => {
      
      entries.forEach(entry => {
        
        if (entry.target.id === 'tile-0') {
          this.topSentCallback(entry);
        } else if (entry.target.id === `tile-${this.state.listSize - 3}`) {
          this.botSentCallback(entry);
        }
      });
    }
    
    var observer = new IntersectionObserver(callback, options);
    observer.observe(document.querySelector("#tile-0"));
    observer.observe(document.querySelector(`#tile-${this.state.listSize - 3}`));
  }
  
  nextData = ()=>{
    fetch(`https://road-cemetery.glitch.me/getData?index=${this.state.apiIndex + 1}`)
    .then(res => res.json())
    .then(
      (result) => {
        
        this.setState({
          DB: [...this.state.DB , ...result],
          apiIndex: this.state.apiIndex + 1
        });
      },
      (error) => {
      }
    )
  }
  
  toggleMenu = ()=>{
    document.querySelector('.mobile-menu').classList.toggle("mobile-hide");
    document.querySelector('.sidebar-wrapper').classList.toggle("showMenu");
  }
  
  render() {
    const isMobile = window.innerWidth < 768;
    return (
      <div>
        <Header onClick={isMobile? this.toggleMenu: null}></Header>
        <div className="content-wrapper">
        {isMobile? null: <Sidebar></Sidebar>}
                  
          <div id="container" >
            <ul className="list-items" stle="top-padding: 0px; bottom-padding: 0px">
            </ul>
          </div>
          <div className={isMobile? 'mobile-menu mobile-hide':'right-sidebar'}>
            <Sidebar></Sidebar>
          </div>
          
        </div>
      </div>
    )
  }
}


