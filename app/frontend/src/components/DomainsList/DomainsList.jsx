import React, {useState} from 'react';
import {getContract, getDomainPrice} from "../../actions";

const CONTRACT_ADDR =  '0x35dD5fd4c743f916bf752b756acC5FF321c5cD58';
export function DomainsList() {
    const [formData, setFormData] = useState({
        domainName: 'com',
        address: CONTRACT_ADDR,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { domainName, address } = formData;
        console.log('Form data submitted:', formData);

        const contract = await getContract(address);
        console.log('CONTRA', contract)

        const price = await getDomainPrice(contract, domainName)
        const price1 = await getDomainPrice(contract, 'pl')
        const price2 = await getDomainPrice(contract, 'test.ua')
        const price3 = await getDomainPrice(contract, 'sub.test.ua')
        const price4 = await getDomainPrice(contract, 'demo.sub.test.ua')
        const price5 = await getDomainPrice(contract, 'stg0.demo.sub.test.ua')
        console.log("PRICE", price);
        console.log("PRICE1", price1);
        console.log("PRICE2", price2);
        console.log("PRICE3", price3);
        console.log("PRICE4", price4);
        console.log("PRICE5", price5);

        // await registerDomain(contract, domainName, price);
        //
        // const registeredDomain = await getDomainAddress(contract, domainName)
        // console.log('DOMAIN ADDRESS', registeredDomain)
    };

    return (
        <div>
            <h2>Domain list</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="domainName">Contract Address:</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="domainName">Domain name:</label>
                    <input
                        type="text"
                        id="domainName"
                        name="domainName"
                        value={formData.domainName}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <button type="submit">Submit</button>
                </div>
            </form>
            <div>
                <h3>Form Data:</h3>
                <p>Domain: {formData.domainName}</p>
            </div>
        </div>
    );
}
