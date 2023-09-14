import React from "react";
import { Nav, NavLink, NavMenu, NavHeader } from "./NavbarElements";
import logo from '../../webasto-logo.png'
// const headerimg = reqiure('../../webasto-logo.png');
const Navbar = () => {
    return (
        <>
            <Nav>
                <NavHeader>
                    {/* <img src={logo}/> */}
                    {/* Make this logo fit into the menu */}
                </NavHeader>
                <NavMenu>
                    <NavLink to="/">
                        PilotTerm Online
                    </NavLink>
                    {/* <NavLink to="/update">
                        Update
                    </NavLink>
                    <NavLink to="/">
                        Settings
                    </NavLink>
                    <NavLink to="/">
                        Auto Upload
                    </NavLink> */}
                </NavMenu>
            </Nav>
        </>
    );
};
 
export default Navbar;