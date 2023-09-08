import {
  chakra,
  Alert,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  LightMode,
  Box,
  useDisclosure,
  Tooltip,
  IconButton,
  Skeleton,
} from '@chakra-ui/react';
import * as Sentry from '@sentry/react';
import QRCode from 'qrcode';
import React from 'react';

import type { Address as AddressType } from 'types/api/address';

import qrCodeIcon from 'icons/qr_code.svg';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';

const SVG_OPTIONS = {
  margin: 0,
};

interface Props {
  className?: string;
  address: AddressType;
  isLoading?: boolean;
}

const AddressQrCode = ({ address, className, isLoading }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ qr, setQr ] = React.useState('');
  const [ error, setError ] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      QRCode.toString(address.hash, SVG_OPTIONS, (error: Error | null | undefined, svg: string) => {
        if (error) {
          setError('We were unable to generate QR code.');
          Sentry.captureException(error, { tags: { source: 'qr_code' } });
          return;
        }

        setError('');
        setQr(svg);
      });
    }
  }, [ address.hash, isOpen, onClose ]);

  if (isLoading) {
    return <Skeleton className={ className } w="36px" h="32px" borderRadius="base"/>;
  }

  return (
    <>
      <Tooltip label="Click to view QR code">
        <IconButton
          className={ className }
          aria-label="Show QR code"
          variant="outline"
          size="sm"
          pl="6px"
          pr="6px"
          onClick={ onOpen }
          icon={ <Icon as={ qrCodeIcon } boxSize={ 5 }/> }
        />
      </Tooltip>

      { error && (
        <Modal isOpen={ isOpen } onClose={ onClose } size={{ base: 'full', lg: 'sm' }}>
          <ModalOverlay/>
          <ModalContent>
            <ModalBody mb={ 0 }>
              <Alert status="warning">{ error }</Alert>
            </ModalBody>
          </ModalContent>
        </Modal>
      ) }
      { !error && (
        <LightMode>
          <Modal isOpen={ isOpen } onClose={ onClose } size={{ base: 'full', lg: 'sm' }}>
            <ModalOverlay/>
            <ModalContent>
              <ModalHeader fontWeight="500" textStyle="h3" mb={ 4 }>Address QR code</ModalHeader>
              <ModalCloseButton/>
              <ModalBody mb={ 0 }>
                <AddressEntity
                  address={ address }
                  mb={ 3 }
                  noLink
                  fontWeight={ 500 }
                  color="text"
                />
                <Box p={ 4 } dangerouslySetInnerHTML={{ __html: qr }}/>
              </ModalBody>
            </ModalContent>
          </Modal>
        </LightMode>
      ) }
    </>
  );
};

export default React.memo(chakra(AddressQrCode));
