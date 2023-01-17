import {Button, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure} from '@chakra-ui/react'
import {HiOutlineSearch} from 'react-icons/hi'
import UsernameForm from './UsernameForm'

export default function ExpandableLeagueSearch() {
    const { isOpen, onOpen, onClose } = useDisclosure()
	return (
		<>
			<IconButton
				size={['sm', 'xs']}
				variant={'ghost'}
        _hover={{background: 'secondary.600'}}
				icon={<HiOutlineSearch />}
				aria-label={'search'}
                onClick={onOpen}
			/>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent background="surface.0" color={"white"}>
          <ModalCloseButton />
          <ModalBody pt={5} my={5} mx={1}>
            <UsernameForm />
          </ModalBody>
        </ModalContent>
      </Modal>
		</>
	)
}
