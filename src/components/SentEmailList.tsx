import { useEffect, useState } from 'react';
import Web3 from 'web3';
import toast from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Modal,
  Box,
  Typography,
} from '@mui/material';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../contracts/DecentralizedEmail';
import { getEmailByWallet } from '../lib/email';

interface Email {
receiver: string;
  subject: string;
  content: string;
  timestamp: number;
  imageHash: string;
  recipientEmail?: string;
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export function SentEmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
          setContract(contractInstance);
        } catch (error) {
          console.error('Error initializing Web3:', error);
          toast.error('Failed to initialize Web3');
        }
      } else {
        toast.error('Ethereum provider not found');
      }
    };

    initializeWeb3();
  }, []);

  useEffect(() => {
    if (contract) {
      fetchSentEmails();
    }
  }, [contract]);

  const fetchSentEmails = async () => {
    try {
      setLoading(true);
      if (contract && typeof contract.methods.getSentEmails === 'function') {
        const accounts = await web3?.eth.requestAccounts();
        if (accounts && accounts.length > 0) {
          const sentMails: Email[] = await contract.methods.getSentEmails().call({ from: accounts[0] });

          const enrichedMails = await Promise.all(
            sentMails.map(async (email) => {
              try {
                const recipientEmail = await getEmailByWallet(email.receiver);
                return {
                  ...email,
                  timestamp: Number(email.timestamp),
                  recipientEmail: recipientEmail || email.receiver,
                };
              } catch (error) {
                console.error('Error fetching email for recipient:', email.receiver, error);
                return {
                  ...email,
                  timestamp: Number(email.timestamp),
                  recipientEmail: email.receiver,
                };
              }
            })
          );

          setEmails(enrichedMails);
        } else {
          toast.error('No accounts found');
        }
      } else {
        toast.error('Sent emails method not found on contract');
      }
    } catch (error) {
      console.error('Error fetching sent emails:', error);
      toast.error('Failed to fetch sent emails');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    const order = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(order);
    const sortedEmails = [...emails].sort((a, b) =>
      order === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
    );
    setEmails(sortedEmails);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleCloseModal = () => {
    setSelectedEmail(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Recipient</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>
                <TableSortLabel active direction={sortOrder} onClick={handleSort}>
                  Date
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emails.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((email, index) => (
              <TableRow key={index} hover onClick={() => handleRowClick(email)}>
                <TableCell>{email.recipientEmail || email.receiver}</TableCell>
                <TableCell>{email.subject}</TableCell>
                <TableCell>{new Date(email.timestamp * 1000).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={emails.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {selectedEmail && (
        <Modal open={true} onClose={handleCloseModal}>
          <Box sx={modalStyle}>
            <Typography variant="h5">{selectedEmail.subject}</Typography>
            <Typography variant="body2">To: {selectedEmail.recipientEmail || selectedEmail.receiver}</Typography>
            <Typography variant="body2">Date: {new Date(selectedEmail.timestamp * 1000).toLocaleString()}</Typography>
            <Typography variant="body1">{selectedEmail.content}</Typography>
          </Box>
        </Modal>
      )}
    </>
  );
}
