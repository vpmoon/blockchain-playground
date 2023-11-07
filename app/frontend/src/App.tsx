import { Routes, Route, Outlet, Link } from "react-router-dom";
import {DomainInfo} from './components/DomainInfo/DomainInfo';
import {RegisterDomain} from './components/RegisterDomain/RegisterDomain';
import {ReleaseDomain} from './components/ReleaseDomain/ReleaseDomain';
import {Withdraw} from './components/Withdraw/Withdraw';
import {DomainsList} from './components/DomainsList/DomainsList';
import {Balances} from './components/Balances/Balances';
import {Connect} from './components/Connect/Connect';
import {Menu} from './components/Menu/Menu';
import './styles/button.css';
import './styles/input.css';
import './styles/title.css';
import './styles/container.css';
import './styles/form.css';
import {useEffect} from "react";
import {subscribe} from "./actions";

export default function App() {

    const doSubscribe = async () => {
        await subscribe();
    }

    useEffect(() => {
        doSubscribe()
    }, []);

  return (
    <div>
      <div className="title">
          <h1>Domain Registry</h1>
          <Connect />
      </div>

      <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<DomainInfo />} />
            <Route path="domain-info" element={<DomainInfo />} />
            <Route path="list" element={<DomainsList />} />
            <Route path="register" element={<RegisterDomain />} />
            <Route path="release" element={<ReleaseDomain />} />
            <Route path="balances" element={<Balances />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </div>
  );
}

function NoMatch() {
    return (
        <div>
            <h2>Nothing to see here!</h2>
            <p>
                <Link to="/">Go to the home page</Link>
            </p>
        </div>
    );
}


function Layout() {
  return (
    <div className="container-wrapper">
      <div className="container-wrapper__menu">
          <Menu/>
      </div>
        <div className="container-wrapper__content">
          <Outlet />
      </div>
    </div>
  );
}


