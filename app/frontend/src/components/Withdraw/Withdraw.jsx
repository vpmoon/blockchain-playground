import React, {useState} from 'react';
import {
    getContract,
    withdraw,
} from "../../actions";

export function Withdraw() {
    const [isLoaded, setLoaded] = useState(false);
    const [formData, setFormData] = useState({
        currency: 'etn',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoaded(false);

        const contract = await getContract();

        const tx = await withdraw(contract, formData.currency);
        await tx.wait();
        setLoaded(true);
    };

    return (
        <div>
            <h2>Withdraw</h2>
            <form onSubmit={handleSubmit}>
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
                    <button className="button" type="submit">Withdraw {formData.currency}</button>
                </div>
            </form>
            {
                isLoaded && (
                    <>
                        <hr/>
                        <div className="response">
                            Successfully withdraw {formData.currency} to your wallet
                        </div>
                    </>
                )
            }

        </div>
    );
}
