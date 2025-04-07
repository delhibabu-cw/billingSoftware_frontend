// import { Viewer, Worker } from "@react-pdf-viewer/core";
// import '@react-pdf-viewer/core/lib/styles/index.css';
import noDataImg from "../../assets/images/noDataFound/image 1866.png"


function DocumentViewer({ open, handleModal, document } : any) {

    if(!open) return null;

  return (
    <>
     <div className="fixed inset-0 z-[1000] flex  items-center justify-center bg-black/70 ">
     <div className={`bg-white/20 backdrop-blur-lg p-4  rounded-lg   w-full flex flex-col  max-h-[97%] h-full   ${document?.key === 'document' ? "max-w-4xl 2xl:max-w-5xl" : "max-w-lg"}`}>
     <div className="flex items-center justify-between pb-2 border-b">
                        <h2 className="text-lg font-medium text-white capitalize font-OpenSans">{document?.title ? document?.title : ""} Viewer</h2>
                        <button
                            type="button"
                            className="text-white/90 hover:text-primaryColor hover:scale-110"
                            onClick={handleModal}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
        <div className="overflow-y-scroll hide-scrollbar">
          {document?.key === 'document' ? (
             <iframe src={document.val} style={{ width: '100%', height: '760px', border: 'none' }} 
             title='Document Viewer'/>
          //   <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
          //   <Viewer fileUrl={document?.val} />
          // </Worker>
          ) : document?.key === 'image' ? (
            <img
              src={document?.val ? document?.val : noDataImg}
              className={`${document?.val ? "w-full h-full mx-auto mt-5" : "mx-auto w-20 h-20 mt-10"} border-none`}
              // style={{ width: '100%', height: '100%', border: 'none' }}
              alt="Image Viewer"
            />
          ) : document?.key === 'video' ? (
            <video
              src={document?.val ? document?.val : noDataImg}
              controls
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Video Player"
            >
              Sorry, your browser doesn't support embedded videos.
            </video>
          ) : document?.key === 'word' ? (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${document?.val}`}
              style={{ width: '100%', height: '650px', border: 'none' }}
              title="Word Document Viewer"
            />
          ) : document?.key === 'excel' ? (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${document?.val}`}
              style={{ width: '100%', height: '650px', border: 'none' }}
              title="Excel Document Viewer"
            />
          ) : document?.key === 'csv' ? (
            <iframe
              src={document?.val}
              style={{ width: '100%', height: '650px', border: 'none' }}
              title="CSV File Viewer"
            />
          ) : (
            <p>Unsupported file type </p>
          )}

        </div>
      </div>
      </div>
    </>
  );
}

export default DocumentViewer;
