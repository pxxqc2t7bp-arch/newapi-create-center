import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Download, ZoomIn, ChevronRight, ChevronLeft, ImagePlus, Upload, Wand2, History, Share } from 'lucide-react';

const icons = {
  Download: <Download />,
  ZoomIn: <ZoomIn />,
  ChevronRight: <ChevronRight />,
  ChevronLeft: <ChevronLeft />,
  ImagePlus: <ImagePlus />,
  Upload: <Upload />,
  Wand2: <Wand2 />,
  History: <History />,
  Share: <Share />
};

Object.entries(icons).forEach(([key, icon]) => {
  console.log(`\n\n--- ${key} ---\n` + renderToStaticMarkup(icon as any));
});
