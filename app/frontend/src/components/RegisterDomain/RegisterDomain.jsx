import React, {useState, useEffect} from 'react';
import {getContract, getDomainPrice, registerDomain} from "../../actions";

export function RegisterDomain() {
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

    useEffect(() => {
        (async () => {
            const contract = await getContract();
            const level1 = await getDomainPrice(contract, 'ua');
            const level2 = await getDomainPrice(contract, 'ua.com');
            const level3 = await getDomainPrice(contract, 'ua.com.ua');
            const level4 = await getDomainPrice(contract, 'demo.ua.com.ua');
            const level5 = await getDomainPrice(contract, 'stg0.demo.ua.com.ua');
            setPrices({level1, level2, level3, level4, level5});
        })()
    }, [getDomainPrice]);

    return (
        <div>
            <h2>Register new domain</h2>
            <div style={{marginBottom: '30px'}}>
                <h3>Prices</h3>
                <div>1 level - 2$</div>
                <div>2 level - 1.5$</div>
                <div>3 level - 1$</div>
                <div>4 level - 0.5$</div>
                <div>5 level - 0.25$</div>
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
