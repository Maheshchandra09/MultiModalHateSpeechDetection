import React, { useEffect, useState } from 'react';
import { getPreviousUploads, getUserId } from '../firebase';

const PreviousUpload = () => {
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    const fetchPreviousUploads = async () => {
      try {
        const userId = await getUserId();
        const userUploads = await getPreviousUploads(userId);
        setUploads(userUploads);
        console.log(userId);
      } catch (error) {
        console.error('Error fetching previous uploads:', error);
      }
    };

    fetchPreviousUploads();
  }, []);

  return (
    <div style={{textAlign : 'center'}}>
      <h2>Previous Uploads</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>File Name</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Download URL</th>
          </tr>
        </thead>
        <tbody>
          {uploads.map((upload, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px', textAlign: 'left' }}>{upload.name}</td>
              <td style={{ padding: '12px', textAlign: 'left' }}>
                <a href={upload.downloadURL} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreviousUpload;
