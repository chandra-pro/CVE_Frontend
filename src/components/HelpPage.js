import React, { useEffect, useState } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;

const HelpPage = () => {
    const [pdfUrl, setPdfUrl] = useState('');

    useEffect(() => {
        const fetchPdfUrl = async () => {
            try {
                const response = await fetch(`${apiUrl}api/pdf-url/`);
                if (response.ok) {
                    const data = await response.json();
                    setPdfUrl(data.pdf_url);
                } else {
                    console.error('Failed to fetch PDF URL');
                }
            } catch (error) {
                console.error('Error fetching PDF URL:', error);
            }
        };
        fetchPdfUrl();
    }, []);

    return (
        <div>
            <h1>Help Page</h1>
            {pdfUrl ? (
                <iframe
                    src={pdfUrl}
                    width="100%"
                    height="600px"
                    title="Help Document"
                    style={{ border: 'none' }}
                />
            ) : (
                <p>Loading PDF...</p>
            )}
        </div>
    );
};

export default HelpPage;
