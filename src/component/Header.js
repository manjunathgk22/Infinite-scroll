import React from 'react';
import '../App.scss';
import logo from '../images/logo.png';
import menu from '../images/menu.png';
const Header = (props) => {

  return (
    <div className="header-wrapper">
    
    <img src={logo}  className="logo-img"></img>
    <img src={menu} onClick={props.onClick} className="menu-img"></img>
    </div>
  )
};

export default Header;

