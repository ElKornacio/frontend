import { Flex, HStack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import { useYlide } from 'lib/contexts/ylide';
import getQueryParamString from 'lib/router/getQueryParamString';
import shortenString from 'lib/shortenString';
import ActionBar from 'ui/shared/ActionBar';
import BookmarkedThreads from 'ui/shared/forum/BookmarkedThreads';
import BookmarkedTopics from 'ui/shared/forum/BookmarkedTopics';
import ChatsAccountsBar from 'ui/shared/forum/ChatsAccountsBar';
import PageTitle from 'ui/shared/Page/PageTitle';
import TabsWithScroll from 'ui/shared/Tabs/TabsWithScroll';

const BookmarksPageContent = () => {
  const router = useRouter();
  const { accounts: { domainAccounts } } = useYlide();
  const hash = getQueryParamString(router.query.hash).toLowerCase();
  const account = domainAccounts.find(d => d.account.address.toLowerCase() === hash);

  const actionBar = (
    <ActionBar mt={ -3 } flexDir={{ sm: 'row', base: 'column' }} alignItems={{ sm: 'center', base: 'stretch' }}>
      <HStack spacing={ 3 } alignItems={{ sm: 'center', base: 'stretch' }}>
        { hash }
      </HStack>
    </ActionBar>
  );

  return (
    <Flex position="relative" flexDir="column">
      <HStack align="center" justify="space-between" mb={ 6 }>
        <PageTitle containerProps={{ mb: 0 }} title={ `Bookmarks of "${ shortenString(hash) }"` } justifyContent="space-between"/>
        <ChatsAccountsBar compact={ true }/>
      </HStack>
      { actionBar }
      <Flex mb={ 6 } flexDir="column" w="100%" align="stretch">
        { account && account.backendAuthKey ? (
          <TabsWithScroll
            w="100%"
            grow={ 1 }
            tabs={ [
              {
                id: 'topics',
                title: 'Topics',
                component: <BookmarkedTopics account={ account }/>,
              },
              {
                id: 'threads',
                title: 'Threads',
                component: <BookmarkedThreads account={ account }/>,
              },
              // {
              //   id: 'replies',
              //   title: 'Replies',
              //   component: null,
              // },
              // {
              //   id: 'addresses',
              //   title: 'Addresses',
              //   component: null,
              // },
            ] }
          />
        ) : (
          <Text>Account not found</Text>
        ) }
      </Flex>
    </Flex>
  );
};

export default BookmarksPageContent;