import React, {useState} from 'react';
import {getContract, getControllerShares} from "../../actions";
import { ethers } from 'ethers'

export function Balances() {
    const [response, setResponse] = useState('');
    const [formData, setFormData] = useState({
        address: '',
        currency: 'etn',
    });

    const resetState = () => {
        setResponse('');
    }

    const handleInputChange = (e) => {
        resetState();
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResponse('');

        const { address, currency } = formData;
        const contract = await getContract();

        const response = await getControllerShares(contract, address, currency);
        setResponse(formData.currency === 'etn' ? getETHPrice(response) : getUSDTPrice(response));
    };

    const getETHPrice = (ethPrice) => {
        return ethers.formatEther(ethPrice)
    }

    const getUSDTPrice = (usdtPrice) => {
        const price = Number(usdtPrice);
        return ethers.formatUnits(price, 8)
    }

    return (
        <div>
            <h2>Balances</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <label htmlFor="address" className="input-label">Domain name</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Address"
                    />
                </div>

                <div>
                    <label>
                        <input
                            name="currency"
                            type="radio"
                            value="etn"
                            checked={formData.currency === 'etn'}
                            onChange={handleInputChange}
                        />
                        ETH
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            name="currency"
                            type="radio"
                            value="usdt"
                            checked={formData.currency === 'usdt'}
                            onChange={handleInputChange}
                        />
                        USDT
                    </label>
                </div>
                <div>
                    <button className="button" type="submit">Get balance</button>
                </div>
            </form>
            {
                response && (
                    <>
                        <hr/>
                        <div className="response">
                            {response} {formData.currency}
                        </div>
                    </>
                )
            }
        </div>
    );
}
