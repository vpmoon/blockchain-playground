import {Link} from "react-router-dom";
import './Menu.css';

export const Menu = () => {
    return (
        <nav className="menu">
            <ul>
                <li>
                    <Link to="/domain-info">Domain information</Link>
                </li>
                <li>
                    <Link to="/list">Domains List</Link>
                </li>
                <li>
                    <Link to="/register">Register domain</Link>
                </li>

                <li>
                    <Link to="/release">Release</Link>
                </li>

                <li>
                    <Link to="/balances">Balances</Link>
                </li>
                <li>
                    <Link to="/withdraw">Withdraw</Link>
                </li>

            </ul>
        </nav>
    )
}
