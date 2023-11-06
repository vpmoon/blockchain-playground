import React, {useState} from 'react';
import {getContract, getDomainAddress} from "../../actions";

export function DomainInfo() {
    const [response, setResponse] = useState('');
    const [formData, setFormData] = useState({
        domainName: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { domainName } = formData;

        const contract = await getContract();
        const price = await getDomainAddress(contract, domainName);

        console.log('price=', price)
        setResponse(price);
    };

    return (
        <div>
            <h2>Domain Info</h2>
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
                    <button className="button" type="submit">Get owner address</button>
                </div>
            </form>
            {
                response && (
                    <>
                        <hr/>
                        <div className="response">
                            {response}
                        </div>
                    </>
                )
            }
        </div>
    );
}
