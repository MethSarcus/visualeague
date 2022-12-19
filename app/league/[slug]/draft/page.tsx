'use client'
import {Spinner} from '@chakra-ui/react'
import {useContext} from 'react'
import DraftValueTable from '../../../../components/tables/DraftValueTable'
import {Context} from '../../../../contexts/Context'

export default function Page() {
	const [context, setContext] = useContext(Context)

	if (!context.settings) return <Spinner />
	return <DraftValueTable draft={context.draft} />
}
