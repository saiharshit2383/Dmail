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
  sender: string;
  subject: string;
  content: string;
  timestamp: number;
  imageHash: string;
  senderEmail?: string; // Optional sender email to be populated
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

export function EmailList() {
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
      fetchEmails();
    }
  }, [contract]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      if (contract && typeof contract.methods.getInbox === 'function') {
        const accounts = await web3?.eth.requestAccounts();
        if (accounts && accounts.length > 0) {
          const inbox: Email[] = await contract.methods.getInbox().call({ from: accounts[0] });

          const enrichedInbox = await Promise.all(
            inbox.map(async (email) => {
              try {
                const senderEmail = await getEmailByWallet(email.sender);
                return {
                  ...email,
                  timestamp: Number(email.timestamp), // Convert BigInt to number
                  senderEmail: senderEmail || email.sender,
                };
              } catch (error) {
                console.error('Error fetching email for sender:', email.sender, error);
                return {
                  ...email,
                  timestamp: Number(email.timestamp), // Convert BigInt to number
                  senderEmail: email.sender,
                };
              }
            })
          );

          setEmails(enrichedInbox);
        } else {
          toast.error('No accounts found');
        }
      } else {
        toast.error('Inbox method not found on contract');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };


  const handleSort = () => {
    const order = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(order);
    const sortedEmails = [...emails].sort((a, b) => {
      return order === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    });
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <TableContainer sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sender</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subject</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={true}
                  direction={sortOrder}
                  onClick={handleSort}
                  sx={{
                    color: 'white',
                    '&:hover': { color: 'secondary.main' },
                  }}
                >
                  Date
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {emails
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((email, index) => (
                <TableRow
                  key={index}
                  hover
                  onClick={() => handleRowClick(email)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: index % 2 === 0 ? 'grey.100' : 'white',
                    '&:hover': { backgroundColor: 'grey.200' },
                  }}
                >
                  <TableCell>{email.senderEmail || email.sender}</TableCell>
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
        sx={{ mt: 2, '& .MuiTablePagination-toolbar': { justifyContent: 'center' } }}
      />


      {selectedEmail && (
        <Modal open={true} onClose={handleCloseModal}>
          <Box
            sx={{
              ...modalStyle,
              width: '70vw',
              height: '70vh',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              {selectedEmail.subject}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              From: {selectedEmail.senderEmail || selectedEmail.sender}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Date: {new Date(Number(selectedEmail.timestamp) * 1000).toLocaleString()}
            </Typography>
            <Box sx={{ overflowY: 'auto', flexGrow: 1, pr: 2 }}>
              <Typography variant="body1" gutterBottom>
                {selectedEmail.content}
              </Typography>
              {selectedEmail.imageHash && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <a
                    href={`https://ipfs.io/ipfs/${selectedEmail.imageHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`https://ipfs.io/ipfs/${selectedEmail.imageHash}`}
                      alt="Attached Image"
                      style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }}
                    />
                  </a>
                </Box>
              )}
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
}
