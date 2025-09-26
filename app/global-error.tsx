'use client';

import { Box, Button, Center, Heading, Link } from "@chakra-ui/react";

const GlobalError = ({
}: {
  error: Error;
  reset: () => void;
}) => {
  return (
					<div className='App'>
						<Center pt={10}>
							<Box>
								<Heading color={'white'} my={2}>
									Error Finding League
								</Heading>

								<Link href={'/'}>
									<Button>Return to homepage</Button>
								</Link>
								<Link
									isExternal={true}
									href={
										'https://github.com/MethSarcus/visualeague/issues/new?assignees=MethSarcus&labels=&template=bug_report.md&title='
									}
								>
									<Button mx={5} variant={'outline'} colorScheme={'red'}>
										Report bug
									</Button>
								</Link>
							</Box>
						</Center>
					</div>
  );
}

export default GlobalError
