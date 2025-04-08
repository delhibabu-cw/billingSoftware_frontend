import  { useMemo } from 'react'
import { getClientApi } from '../../../api-service/admin';
import { useQuery } from '@tanstack/react-query';
import { decryptPassword } from '../../../utils/helper';

const ClientsSingleViewModal = ({ openModal, modalId } : any) => {

  if(!openModal) return null;

  const getClientData = useQuery({
    queryKey: ['getClientData', modalId],
    queryFn: () => getClientApi(`/${modalId}`),
})

const clientData = getClientData?.data?.data?.result

const plainPassword = useMemo(() => {
  if (clientData?.password && clientData?.passwordIv) {
    const result = decryptPassword(clientData.password, clientData.passwordIv);
    console.log('Decrypted password:', result);
    return result;
  }
  return '';
}, [clientData?.password, clientData?.passwordIv]);


console.log('plainPassword:', plainPassword);


  return (
    <div>ClientsSingleViewModal</div>
  )
}

export default ClientsSingleViewModal