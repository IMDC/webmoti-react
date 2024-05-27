import { LocalVideoTrack, Room } from 'twilio-video';
import { useCallback, useEffect } from 'react';
import {
  BACKGROUND_FILTER_VIDEO_CONSTRAINTS,
  DEFAULT_VIDEO_CONSTRAINTS,
  SELECTED_BACKGROUND_SETTINGS_KEY,
} from '../../../constants';
import {
  GaussianBlurBackgroundProcessor,
  ImageFit,
  isSupported,
  VirtualBackgroundProcessor,
} from '@twilio/video-processors';
import Abstract from '../../../images/Abstract.jpg';
import AbstractThumb from '../../../images/thumb/Abstract.jpg';
import BohoHome from '../../../images/BohoHome.jpg';
import BohoHomeThumb from '../../../images/thumb/BohoHome.jpg';
import Bookshelf from '../../../images/Bookshelf.jpg';
import BookshelfThumb from '../../../images/thumb/Bookshelf.jpg';
import CoffeeShop from '../../../images/CoffeeShop.jpg';
import CoffeeShopThumb from '../../../images/thumb/CoffeeShop.jpg';
import Contemporary from '../../../images/Contemporary.jpg';
import ContemporaryThumb from '../../../images/thumb/Contemporary.jpg';
import CozyHome from '../../../images/CozyHome.jpg';
import CozyHomeThumb from '../../../images/thumb/CozyHome.jpg';
import Desert from '../../../images/Desert.jpg';
import DesertThumb from '../../../images/thumb/Desert.jpg';
import Fishing from '../../../images/Fishing.jpg';
import FishingThumb from '../../../images/thumb/Fishing.jpg';
import Flower from '../../../images/Flower.jpg';
import FlowerThumb from '../../../images/thumb/Flower.jpg';
import Kitchen from '../../../images/Kitchen.jpg';
import KitchenThumb from '../../../images/thumb/Kitchen.jpg';
import ModernHome from '../../../images/ModernHome.jpg';
import ModernHomeThumb from '../../../images/thumb/ModernHome.jpg';
import Nature from '../../../images/Nature.jpg';
import NatureThumb from '../../../images/thumb/Nature.jpg';
import Ocean from '../../../images/Ocean.jpg';
import OceanThumb from '../../../images/thumb/Ocean.jpg';
import Patio from '../../../images/Patio.jpg';
import PatioThumb from '../../../images/thumb/Patio.jpg';
import Plant from '../../../images/Plant.jpg';
import PlantThumb from '../../../images/thumb/Plant.jpg';
import SanFrancisco from '../../../images/SanFrancisco.jpg';
import SanFranciscoThumb from '../../../images/thumb/SanFrancisco.jpg';
import { Thumbnail } from '../../BackgroundSelectionDialog/BackgroundThumbnail/BackgroundThumbnail';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState/useLocalStorageState';

export interface BackgroundSettings {
  type: Thumbnail;
  index?: number;
}

const images = [
  { name: 'Abstract', thumb: AbstractThumb, rawPath: Abstract, description: 'Blue and orange clouds of smoke' },
  { name: 'Boho Home', thumb: BohoHomeThumb, rawPath: BohoHome, description: 'Well furnished living room of a house' },
  { name: 'Bookshelf', thumb: BookshelfThumb, rawPath: Bookshelf, description: 'Five bookshelves filled with books' },
  {
    name: 'Coffee Shop',
    thumb: CoffeeShopThumb,
    rawPath: CoffeeShop,
    description: 'Coffee shop counter with a cashier working there',
  },
  {
    name: 'Contemporary',
    thumb: ContemporaryThumb,
    rawPath: Contemporary,
    description: 'A room with luxury furniture and high contrast',
  },
  {
    name: 'Cozy Home',
    thumb: CozyHomeThumb,
    rawPath: CozyHome,
    description: 'A room with minimalist design and some plants',
  },
  {
    name: 'Desert',
    thumb: DesertThumb,
    rawPath: Desert,
    description: 'A large orange sand dune under a cloudy blue sky',
  },
  { name: 'Fishing', thumb: FishingThumb, rawPath: Fishing, description: 'A fishing boat and some fish' },
  { name: 'Flower', thumb: FlowerThumb, rawPath: Flower, description: 'Close up of pink flowers' },
  { name: 'Kitchen', thumb: KitchenThumb, rawPath: Kitchen, description: 'A clean modern looking kitchen' },
  {
    name: 'Modern Home',
    thumb: ModernHomeThumb,
    rawPath: ModernHome,
    description: 'Open concept room with art on the walls',
  },
  { name: 'Nature', thumb: NatureThumb, rawPath: Nature, description: 'Red mountains at evening' },
  { name: 'Ocean', thumb: OceanThumb, rawPath: Ocean, description: 'Clear water washing against a beach' },
  { name: 'Patio', thumb: PatioThumb, rawPath: Patio, description: 'A table outside a rustic house' },
  { name: 'Plant', thumb: PlantThumb, rawPath: Plant, description: 'Close up of some wavy leaves' },
  {
    name: 'San Francisco',
    thumb: SanFranciscoThumb,
    rawPath: SanFrancisco,
    description: 'The Golden Gate bridge in San Francisco',
  },
];

const isDesktopChrome = /Chrome/.test(navigator.userAgent);
let imageElements = new Map();

const getImage = (index: number): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (imageElements.has(index)) {
      return resolve(imageElements.get(index));
    }
    const img = new Image();
    img.onload = () => {
      imageElements.set(index, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = images[index].rawPath;
  });
};

export const backgroundConfig = {
  images,
};

const virtualBackgroundAssets = '/virtualbackground';
let blurProcessor: GaussianBlurBackgroundProcessor;
let virtualBackgroundProcessor: VirtualBackgroundProcessor;

export default function useBackgroundSettings(videoTrack: LocalVideoTrack | undefined, room?: Room | null) {
  const [backgroundSettings, setBackgroundSettings] = useLocalStorageState<BackgroundSettings>(
    SELECTED_BACKGROUND_SETTINGS_KEY,
    { type: 'none', index: 0 }
  );

  const setCaptureConstraints = useCallback(async () => {
    const { mediaStreamTrack, processor } = videoTrack ?? {};
    const { type } = backgroundSettings;
    if (type === 'none' && processor) {
      return mediaStreamTrack?.applyConstraints(DEFAULT_VIDEO_CONSTRAINTS as MediaTrackConstraints);
    } else if (type !== 'none' && !processor) {
      return mediaStreamTrack?.applyConstraints(BACKGROUND_FILTER_VIDEO_CONSTRAINTS as MediaTrackConstraints);
    }
  }, [backgroundSettings, videoTrack]);

  const removeProcessor = useCallback(() => {
    if (videoTrack && videoTrack.processor) {
      videoTrack.removeProcessor(videoTrack.processor);
    }
  }, [videoTrack]);

  const addProcessor = useCallback(
    (processor: GaussianBlurBackgroundProcessor | VirtualBackgroundProcessor) => {
      if (!videoTrack || videoTrack.processor === processor) {
        return;
      }
      removeProcessor();
      videoTrack.addProcessor(processor, {
        inputFrameBufferType: 'video',
        outputFrameBufferContextType: 'webgl2',
      });
    },
    [videoTrack, removeProcessor]
  );

  useEffect(() => {
    if (!isSupported) {
      return;
    }
    // make sure localParticipant has joined room before applying video processors
    // this ensures that the video processors are not applied on the LocalVideoPreview
    const handleProcessorChange = async () => {
      if (!blurProcessor) {
        blurProcessor = new GaussianBlurBackgroundProcessor({
          assetsPath: virtualBackgroundAssets,
          // Disable debounce only on desktop Chrome as other browsers either
          // do not support WebAssembly SIMD or they degrade performance.
          debounce: !isDesktopChrome,
        });
        await blurProcessor.loadModel();
      }
      if (!virtualBackgroundProcessor) {
        virtualBackgroundProcessor = new VirtualBackgroundProcessor({
          assetsPath: virtualBackgroundAssets,
          backgroundImage: await getImage(0),
          // Disable debounce only on desktop Chrome as other browsers either
          // do not support WebAssembly SIMD or they degrade performance.
          debounce: !isDesktopChrome,
          fitType: ImageFit.Cover,
        });
        await virtualBackgroundProcessor.loadModel();
      }
      if (!room?.localParticipant) {
        return;
      }

      // Switch to 640x480 dimensions on desktop Chrome or browsers that
      // do not support WebAssembly SIMD to achieve optimum performance.
      const processor = blurProcessor || virtualBackgroundProcessor;
      // @ts-ignore
      if (!processor._isSimdEnabled || isDesktopChrome) {
        await setCaptureConstraints();
      }

      if (backgroundSettings.type === 'blur') {
        addProcessor(blurProcessor);
      } else if (backgroundSettings.type === 'image' && typeof backgroundSettings.index === 'number') {
        virtualBackgroundProcessor.backgroundImage = await getImage(backgroundSettings.index);
        addProcessor(virtualBackgroundProcessor);
      } else {
        removeProcessor();
      }
    };
    handleProcessorChange();
  }, [backgroundSettings, videoTrack, room, addProcessor, removeProcessor, setCaptureConstraints]);

  return [backgroundSettings, setBackgroundSettings] as const;
}
