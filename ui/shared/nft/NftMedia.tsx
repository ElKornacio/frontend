import { AspectRatio, chakra, Skeleton } from '@chakra-ui/react';
import React from 'react';
import { useInView } from 'react-intersection-observer';

import type { StaticRoute } from 'nextjs-routes';
import { route } from 'nextjs-routes';

import useFetch from 'lib/hooks/useFetch';

import NftFallback from './NftFallback';
import NftHtml from './NftHtml';
import NftHtmlWithFullscreen from './NftHtmlWithFullscreen';
import NftImage from './NftImage';
import NftImageWithFullscreen from './NftImageWithFullscreen';
import NftVideo from './NftVideo';
import NftVideoWithFullscreen from './NftVideoWithFullscreen';
import type { MediaType } from './utils';
import { getPreliminaryMediaType } from './utils';

interface Props {
  url: string | null;
  className?: string;
  isLoading?: boolean;
  withFullscreen?: boolean;
}

const NftMedia = ({ url, className, isLoading, withFullscreen }: Props) => {
  const [ type, setType ] = React.useState<MediaType | undefined>();
  const [ isMediaLoading, setIsMediaLoading ] = React.useState(Boolean(url));
  const [ isLoadingError, setIsLoadingError ] = React.useState(false);

  const fetch = useFetch();
  const { ref, inView } = useInView({ triggerOnce: true });

  React.useEffect(() => {
    if (!url || isLoading || !inView) {
      return;
    }

    // media could be either image, gif or video
    // so we pre-fetch the resources in order to get its content type
    // have to do it via Node.js due to strict CSP for connect-src
    // but in order not to abuse our server firstly we check file url extension
    // and if it is valid we will trust it and display corresponding media component

    const preliminaryType = getPreliminaryMediaType(url);

    if (preliminaryType) {
      setType(preliminaryType);
      return;
    }

    const mediaTypeResourceUrl = route({ pathname: '/node-api/media-type' as StaticRoute<'/api/media-type'>['pathname'], query: { url } });
    fetch(mediaTypeResourceUrl)
      .then((_data) => {
        const data = _data as { type: MediaType | undefined };
        setType(data.type || 'image');
      })
      .catch(() => {
        setType('image');
      });

  }, [ url, isLoading, fetch, inView ]);

  const handleMediaLoaded = React.useCallback(() => {
    setIsMediaLoading(false);
  }, []);

  const handleMediaLoadError = React.useCallback(() => {
    setIsMediaLoading(false);
    setIsLoadingError(true);
  }, []);

  const content = (() => {
    if (!url || isLoadingError) {
      return <NftFallback/>;
    }

    const props = {
      src: url,
      onLoad: handleMediaLoaded,
      onError: handleMediaLoadError,
    };

    switch (type) {
      case 'video':
        return withFullscreen ? <NftVideoWithFullscreen { ...props }/> : <NftVideo { ...props }/>;
      case 'html':
        return withFullscreen ? <NftHtmlWithFullscreen { ...props }/> : <NftHtml { ...props }/>;
      case 'image':
        return withFullscreen ? <NftImageWithFullscreen { ...props }/> : <NftImage { ...props }/>;
      default:
        return null;
    }
  })();

  return (
    <AspectRatio
      ref={ ref }
      className={ className }
      ratio={ 1 / 1 }
      overflow="hidden"
      borderRadius="md"
      objectFit="contain"
      isolation="isolate"
      sx={{
        '&>img, &>video': {
          objectFit: 'contain',
        },
      }}
    >
      <>
        { content }
        { isMediaLoading && <Skeleton position="absolute" left={ 0 } top={ 0 } w="100%" h="100%" zIndex="1"/> }
      </>
    </AspectRatio>
  );
};

export default chakra(NftMedia);
