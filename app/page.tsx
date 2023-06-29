import React, { useRef, useEffect, useState } from 'react';
import Camera from './camera';

export default function Home() {

  return (
    <div>
      <h1 className="text-3xl font-bold m-2 text-center">Epic Flavor</h1>
      <Camera/>
    </div>
  );
}
