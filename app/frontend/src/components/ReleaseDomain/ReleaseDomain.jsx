import React, {useState} from 'react';
import { getContract, releaseDomain } from "../../actions";

export function ReleaseDomain() {
    const [isLoaded, setLoaded] = useState(false);
    const [formData, setFormData] = useState({
        domainName: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoaded(false);
        const { domainName } = formData;

        const contract = await getContract();
        const tx = await releaseDomain(contract, domainName);
        await tx.wait();

        setLoaded(true);
    };

    return (
        <div>
            <h2>Release Domain</h2>
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
                    <button className="button button-danger" type="submit">Release domain</button>
                </div>
            </form>
            {
                isLoaded && (
                    <>
                        <hr/>
                        <div className="response">
                            Domain has been successfully released.
                        </div>
                    </>
                )
            }
        </div>
    );
}
