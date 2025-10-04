export default function VideoPlayer({ src }) {
  return (
    <div className="w-full flex justify-center bg-black">
      <video controls className="w-full max-w-4xl rounded-lg mt-6">
        <source src={src} type="video/mp4" />
        Your browser does not support video playback.
      </video>
    </div>
  );
}
