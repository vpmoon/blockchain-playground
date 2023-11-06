import React, {useState, useEffect} from 'react';
import {getContract, getDomainPrice, registerDomain} from "../../actions";
import { ethers } from 'ethers'

export function RegisterDomain() {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setLoaded] = useState(false);
    const [price, setPrice] = useState(0);
    const [formData, setFormData] = useState({
        domainName: '',
        currency: 'etn',
    });
    const [prices, setPrices] = useState();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log('NAA', name, value)
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPrice(0);
        setLoaded(false);

        const { domainName, currency } = formData;
        const contract = await getContract();
        const price = await getDomainPrice(contract, domainName);

        const tx = await registerDomain(contract, domainName, price, currency);
        await tx.wait();

        setPrice(Number(price));
        setLoaded(true);
    };
    const getETHPrice = (ethPrice) => {
        return ethers.formatEther(ethPrice)
    }

    const getUSDTPrice = (usdtPrice) => {
        const price = Number(usdtPrice);
        return ethers.formatUnits(price, 8)
    }

    const getPrices = async (currency = 'etn') => {
        setIsLoading(true);
        const isEtn = currency === 'etn';

        const contract = await getContract();
        const level1 = await getDomainPrice(contract, 'ua', currency);

        const level2 = await getDomainPrice(contract, 'ua.com', currency);
        const level3 = await getDomainPrice(contract, 'ua.com.ua', currency);
        const level4 = await getDomainPrice(contract, 'demo.ua.com.ua', currency);
        const level5 = await getDomainPrice(contract, 'stg0.demo.ua.com.ua', currency);
        console.log(level1, level2, level3)
        setPrices({
            level1: isEtn ? getETHPrice(level1) : getUSDTPrice(level1),
            level2: isEtn ? getETHPrice(level2) : getUSDTPrice(level2),
            level3: isEtn ? getETHPrice(level3) : getUSDTPrice(level3),
            level4: isEtn ? getETHPrice(level4) : getUSDTPrice(level4),
            level5: isEtn ? getETHPrice(level5) : getUSDTPrice(level5),
        });
        setIsLoading(false);
    }

    useEffect(() => {
        getPrices();
    }, [getDomainPrice]);

    useEffect(() => {
        getPrices(formData.currency);
    }, [formData.currency]);

    return (
        <div>
            <h2>Register new domain</h2>
            <div style={{marginBottom: '30px'}}>
                <h3>Prices</h3>
                {
                    isLoading ? (
                        '.....Price is loading.....'
                    ): (
                        <>
                            <div>1 level - {prices?.level1} {formData.currency}</div>
                            <div>2 level - {prices?.level2} {formData.currency}</div>
                            <div>3 level - {prices?.level3} {formData.currency}</div>
                            <div>4 level - {prices?.level4} {formData.currency}</div>
                            <div>5 level - {prices?.level5} {formData.currency}</div>
                        </>
                    )
                }
            </div>
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <label htmlFor="domain" className="input-label">Domain name</label>
                    <input
                        type="text"
                        id="domainName"
                        name="domainName"
                        value={formData.domainName}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Domain name"
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
                    <button className="button" type="submit">Register domain</button>
                </div>
            </form>
            {
                isLoaded && (
                    <>
                        <hr/>
                        <div className="response">
                            Domain has been successfully registered with price {price}{formData.currency}
                        </div>
                    </>
                )
            }
        </div>
    );
}
