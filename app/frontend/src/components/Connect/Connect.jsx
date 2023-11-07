// Page1.js
import React, {useEffect, useState} from 'react';
import {isMetamaskInstalled, getAccount} from "../../actions";

export function Connect() {
    const [metamaskState, setMetamaskState] = useState(null);
    const [account, setAccount] = useState(null);

    const checkMetamaskInstalled = () => {
        setMetamaskState(isMetamaskInstalled())
    }

    useEffect(() => {
        checkMetamaskInstalled();
    }, []);

    useEffect(() => {
        if (metamaskState === false) {
            alert('Install metamask to continue');
        }
    }, [metamaskState]);

    const onClickConnect = async () => {
        const account = await getAccount();
        setAccount(account);
    };

    return (
        <div>
            <div className="error">
                {!metamaskState ? 'Metamask is not connected' : null}
            </div>
            <div>
                {
                    account ? (
                        <div>Account: <b>{account}</b></div>
                    ) : (
                        <button className="button" onClick={onClickConnect}>Connect</button>
                    )
                }
            </div>
        </div>
    );
}

