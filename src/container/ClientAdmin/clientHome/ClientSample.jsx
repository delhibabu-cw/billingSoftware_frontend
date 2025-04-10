import React from 'react'

const clientSample = () => {

     const totalAmount = useMemo(() => {
            if (!selectedProducts || selectedProducts.length === 0) return '0.00';
    
            return selectedProducts.reduce((sum, product) => {
                const unitPrice = product?.productAddedFromStock === 'yes' ? product?.actualPrice : product?.price;
                const gstPerUnit = profileData?.overAllGstToggle === 'on' ? product?.gstAmount : 0;
    
                const totalPerItem = (unitPrice + gstPerUnit) * product?.quantitySelected;
                return sum + totalPerItem;
            }, 0).toFixed(2);
        }, [selectedProducts, profileData?.overAllGstToggle]);
    
    
        console.log('totalAmount', totalAmount);
        console.log('selected products', selectedProducts);
    
        const getBillPageData = useQuery({
            queryKey: ["getBillPageData"],
            queryFn: () => getBillPageAi(""),
        });

       const handleCreateBill = async () => {
            try {
              setLoading(true);
          
              const payload = {
                totalAmount,
                selectedProducts: selectedProducts?.map((idx) => {
                  const gstAmountPerUnit =
                    profileData?.overAllGstToggle === "on" ? idx.gstAmount : 0;
                  const totalGstAmount = gstAmountPerUnit * idx.quantitySelected;
          
                  return {
                    productId: idx?._id,
                    quantity: idx?.quantitySelected,
                    name: idx?.name,
                    price: idx.price,
                    actualPrice: idx?.actualPrice,
                    profitMargin: idx?.profitMargin,
                    gstAmount: totalGstAmount,
                    gstWithoutTotal:
                      (idx?.productAddedFromStock === "yes"
                        ? idx?.actualPrice
                        : idx.price) * idx.quantitySelected,
                    gstWithTotal:
                      profileData?.overAllGstToggle === "on"
                        ? (idx?.productAddedFromStock === "yes"
                            ? idx?.actualPrice
                            : idx.price + idx.gstAmount) * idx.quantitySelected
                        : (idx?.productAddedFromStock === "yes"
                            ? idx?.actualPrice
                            : idx.price) * idx.quantitySelected,
                    productAddedFromStock: idx?.productAddedFromStock,
                  };
                }),
              };
          
              const postApi = await postCreateBillApi(payload);
          
              if (postApi?.status === 200) {
                toast.success(postApi?.data?.msg);
                const billPayload = {
                  billNo: postApi?.data?.result?.billNo || "N/A",
                  dateTime: postApi?.data?.result?.createdAt,
                  totalAmount: payload.totalAmount,
                  selectedProducts: payload.selectedProducts,
                  customer: postApi?.data?.result?.customer,
                  employee: postApi?.data?.result?.employee,
                };
          
                // Wait for the query to refetch with billData
                await getBillPageData.refetch();
          
                // Then print
                handlePrint(billPayload, getBillPageData?.data?.data?.result);
          
                setSelectedProducts([]);
              }
            } catch (err) {
              console.log(err);
            } finally {
              setLoading(false);
            }
          };

    const generatePrintContent = (billData) => {
        // const dateTime = formatDateTime(new Date(billData.createdAt));
    
        return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Print Bill</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
        }
        .header h3, .header h6, .header h1 {
          margin: 0;
          padding: 0;
        }
        .header hr {
          border: none;
          border-top: 1px dotted #000;
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          
        }
        th {
          font-weight: bold;
          background-color: #f4f4f4;
          border-bottom: 1px dotted #000;
        }
        .total-row td {
          border-top: 1px dotted #000;
          font-weight: bold;
          border-bottom: 1px dotted #000;
        }
        .footer p {
          margin: 0;
          font-size: 9px;
          color: #000;
          font-weight: 600;
          margin-left:0px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p class="date">Date & Time: </p>
        <div class="header">
          <h1>குமரன் பவன்</h1>
          <h6>15/15, தாழையாத்தம் பஜார்,<br>(சௌத் இண்டியன் பேங்க் எதிரில்) குடியாத்தம். Ph:9894470116.</h6>
          <hr>
          <h3>Cash Bill</h3>
          <hr>
        </div>
    
        <div class="section">
          <table>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${billData.selectedProducts.map((product, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${product.name}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>${product.quantity}</td>
                  <td>${(product.total * product.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4">Total:</td>
                <td>${billData.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
    <div>
    <h3> இங்கு பிரெஷ் ஜூஸ் கிடைக்கும் </h3>
    </div>
        <div class="footer">
          <p>Billing Partner CORPWINGS IT SERVICE 6380341944</p>
        </div>
      </div>
    </body>
    </html>
        `;
      };
    
      const handlePrint = (billData) => {
        const printContent = generatePrintContent(billData);
    
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-10000px';
        iframe.style.left = '-10000px';
    
        document.body.appendChild(iframe);
    
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(printContent);
        iframe.contentWindow.print();
      };

      

  return (
    <div>clientSample</div>
  )
}

export default clientSample