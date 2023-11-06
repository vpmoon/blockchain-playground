import React, {useState, useEffect} from 'react';
import {getEventsList} from "../../actions";

export function DomainsList() {
    const [items, setItems] = useState([]);

    const fetchList = async () => {
        const list = await getEventsList();
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log(list);
        setItems(list);
    }

    const formattedDate = (dateStr) => {
        return new Date(dateStr).toISOString().slice(0, 19).replace("T", " ");
    }

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div>
            <h2>Domain list</h2>
            {
                !!items.length ? (
                    <ul>
                        {
                            items.map(({domainName, date}, i) => {
                                return (
                                    <li key={i}>
                                        Registered at: {formattedDate(date)} <b>{domainName}</b>
                                    </li>
                                )
                            })
                        }
                    </ul>
                ) : 'No items'
            }
        </div>
    );
}
