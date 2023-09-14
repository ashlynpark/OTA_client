import React from "react";
import { Nav, NavLink, NavMenu, NavHeader } from "./NavbarElements";
import logo from '../../webasto-logo.png'
// const headerimg = reqiure('../../webasto-logo.png');

const styles = {
    logo:{
        maxWidth: '100%',
        height: 'auto'
    },
    logoContainer:{
        width: '300px',
        marginTop: '-45px',
        marginLeft: '-20%'
    }
}
const Navbar = () => {
    return (
        <>
            <Nav>
                <NavHeader>
                    <div style={styles.logoContainer}>
                        <img src={logo} style={styles.logo}/>
                    </div>
                    {/* Make this logo fit into the menu */}
                </NavHeader>
                <NavMenu>
                    <NavLink to="/">
                        Terminal
                    </NavLink>
                    <NavLink to="/settings">
                        Settings
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