

import subprocess
from bs4 import BeautifulSoup
import logging
import re
import base64
import os
import pytz

import datetime
from django.http import FileResponse, Http404
from rest_framework.response import Response
from rest_framework import status

import json
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.units import inch
import markdown
from weasyprint import HTML


def utc_date_time():
    karachi_timezone = pytz.timezone("Asia/Karachi")

    karachi_time = datetime.datetime.now(karachi_timezone)

    utc_time = karachi_time.astimezone(pytz.utc)

    print("UTC time:", utc_time)
    return utc_time

def wrap_english_text(text):
    """Detects English words/numbers and wraps them in a <span dir="ltr">."""
    return re.sub(r'([A-Za-z0-9,.%-]+)', r'<span dir="ltr">\1</span>', text)

def adjust_english_words_in_html(html_file_path):
    with open(html_file_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')

    for td in soup.find_all('td', {'dir': 'rtl', 'class': 'text'}):
        if td.text.strip():  # Check if the cell has any text
            wrapped_text = wrap_english_text(td.decode_contents())  # Preserve all content
            td.clear()  # Clear existing content safely
            td.append(BeautifulSoup(wrapped_text, 'html.parser'))  # Replace with wrapped content

    with open(html_file_path, 'w', encoding='utf-8') as file:
        file.write(str(soup))


def generate_pdf_from_html(html_link, output_file):
    """
    Generate a PDF from the HTML file using wkhtmltopdf.
    """
    # Full path to wkhtmltopdf binary (update with your actual path if necessary)
    wkhtmltopdf_path = r"wkhtmltopdf"  # Update path if needed
    
    # Command to run wkhtmltopdf
    command = [
        wkhtmltopdf_path,
        '--encoding', 'utf-8',
        '--no-outline',
        '--page-size', 'A4',  # Ensures A4 size pages
        '--enable-local-file-access',  # Allow local file access for resources
        '--footer-center', '[page]',  # Optional: Page number in footer
        '--disable-smart-shrinking',  # Prevent shrinking content to fit page size
        html_link, output_file
    ]
    
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    
    try:
        # Run the command using subprocess with an optional timeout (e.g., 60 seconds)
        subprocess.run(command, check=True, timeout=60)
        logging.info(f"PDF successfully created: {output_file}")
    except subprocess.CalledProcessError as e:
        logging.error(f"Error generating PDF: {e}")
    except FileNotFoundError:
        logging.error("wkhtmltopdf is not installed or not found in PATH. Please install it.")
    except subprocess.TimeoutExpired:
        logging.error("PDF generation timed out after 60 seconds.")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")


def serve_pdf(pdf_file_path):
    """
    Returns a response with the PDF file so the client can download it.
    """
    try:
        # Check if the file exists before trying to open it
        if not os.path.exists(pdf_file_path):
            raise Http404("PDF file not found")

        # Return the PDF file as an attachment in the response
        response = FileResponse(open(pdf_file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(pdf_file_path)}"'
        return response

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def image_to_base64(image_path):
    """
    Convert an image file to a Base64-encoded string.
    """
    with open(image_path, "rb") as img_file:
        # Read the image and encode it to Base64
        encoded_string = base64.b64encode(img_file.read()).decode("utf-8")
    return encoded_string


def parse_markdown_tables(text):
    """Parse markdown text with optional section headers and tables into structured data."""
    parsed_data = []
    
    sections = re.findall(r'\*\*(.*?)\*\*\n(.*?)(?=\n\*\*|\Z)', text, re.DOTALL)
    
    if sections:
        for header, content in sections:
            lines = [line.strip() for line in content.strip().split('\n')]
            rows = []
            for line in lines:
                if line.startswith('|'):
                    cells = [cell.strip() for cell in line.split('|')[1:-1]]
                    rows.append(cells)
            
            if len(rows) < 2:
                continue  # Need at least header and separator
            
            headers = rows[0]
            headers = [header.strip('*') for header in headers] 
            print("headers is ----------------->>>",headers)
            data = [dict(zip(headers, row)) for row in rows[2:] if len(row) == len(headers)]
            
            parsed_data.append((header.strip("*"), data))
    else:
        lines = [line.strip() for line in text.strip().split('\n')]
        rows = []
        for line in lines:
            if line.startswith('|'):
                cells = [cell.strip() for cell in line.split('|')[1:-1]]
                rows.append(cells)
        
        if len(rows) >= 2:
            headers = rows[0]
            headers = [f"<b>{header.strip('*')}</b>" for header in headers] 
            print("headers is ----------------->>>",headers)
            data = [dict(zip(headers, row)) for row in rows[2:] if len(row) == len(headers)]
            parsed_data.append(("", data))
    
    return parsed_data

from reportlab.lib.pagesizes import A4

# PDF Generation Configuration
def create_pdf_report(data, output_filename, title):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=A4,
        title="Security Report",
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=0.3 * inch,   # Reduced margins to fit content
        rightMargin=0.3 * inch
    )
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='LeftTitle', parent=styles['Heading2'], alignment=TA_LEFT))
    styles.add(ParagraphStyle(name='CenterTitle', parent=styles['Heading2'], alignment=TA_CENTER))
    
    elements = []
    
    # Add header image
    header_image = Image("media/logo/header.JPG", width=7.5*inch, height=1.0*inch)
    elements.extend([header_image, Spacer(1, 0.3*inch)])
    
    # Main title and date
    elements.append(Paragraph(f"<b>{title.upper()}</b>", styles['CenterTitle']))
    elements.append(Paragraph(datetime.now().strftime("%B %d, %Y"), styles['CenterTitle']))
    elements.append(Spacer(1, 0.3*inch))
    
    # Process each section
    for section_header, table_data in data:
        # Add section header
        elements.append(Paragraph(f"<b>{section_header}</b>", styles['LeftTitle']))
        elements.append(Spacer(1, 0.2*inch))
        
        # Create table
        if table_data:
            headers = list(table_data[0].keys())
            table_rows = [[Paragraph(col, styles['Normal']) for col in headers]]
            table_rows += [[Paragraph(str(item[h]), styles['Normal']) for h in headers] for item in table_data]
                        
            col_widths = [80, 80, 70, 120, 140, 65]  # Total ≈ 555 points (fits A4)
            if len(headers) <= 3:
                print("in the if >= 3")
                col_widths = [120, 300, 100]
            else:
                print("in the if >= 3")
                col_widths = col_widths
            table = Table(table_rows, colWidths=col_widths)
            table.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), colors.whitesmoke),
                ("ALIGN", (0,0), (-1,-1), "LEFT"),
                ("GRID", (0,0), (-1,-1), 1, colors.black),
                ("VALIGN", (0,0), (-1,-1), "TOP"),
                ("WORDWRAP", (0,0), (-1,-1), "CJK"),
                ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
                ("TEXTCOLOR", (0,0), (-1,0), colors.black),
                ("FONTSIZE", (0,0), (-1,-1), 9),  # Reduced font size for better fit
            ]))
            elements.append(table)
            elements.append(Spacer(1, 0.3*inch))
    
    # Watermark function remains the same
    def draw_watermark(canvas, doc):
        canvas.saveState()
        canvas.drawImage("media/logo/watermark1.jpg", 150, 250, width=300, height=300, mask="auto")
        canvas.restoreState()
    
    doc.build(elements, onFirstPage=draw_watermark, onLaterPages=draw_watermark)

def markdown_to_pdf(markdown_text, output_pdf="report.pdf", report_title="رپورٹ"):
    """
    Converts Markdown text to a professional-looking PDF with a watermark on every page.
    """

    # Get absolute paths for images
    image_path = os.path.abspath("media/logo/header.JPG")
    watermark_path = os.path.abspath("media/logo/watermark1.jpg")

    # Get today's date in a readable format (e.g., 24 February 2025)
    current_date = datetime.today().strftime("%d %B %Y")

    # Convert Markdown to HTML with table support
    html_content = markdown.markdown(markdown_text, extensions=["tables"])

    # Full HTML structure with date added
    full_html = f"""
        <!DOCTYPE html>
        <html lang="ur" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>{report_title}</title>
            <style>
                @page {{
                    size: A4;
                    margin: 20mm 15mm 25mm 15mm; /* Adjust margins */
                }}

                @font-face {{
                    font-family: 'Jameel Noori Nastaleeq Regular';
                    src: url('http://192.168.11.60:8001/static/fonts/JameelNooriNastaleeqKasheeda.ttf') format('truetype');
                }}

                body {{
                    font-family: 'Jameel Noori Nastaleeq Regular', Arial, sans-serif;
                    direction: rtl;
                    text-align: right;
                    margin: 0;
                    padding: 0;
                    background-color: #FFFFFF;
                    position: relative;
                }}

                /* Watermark */
                .watermark {{
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.8;
                    width: 60%;
                    height: auto;
                    z-index: -1;
                }}
                
                /* Header */
                .header {{
                    text-align: center;
                    padding-bottom: 10px;
                    border-bottom: 3px solid #004080;
                    margin-bottom: 15px;
                }}

                .header img {{
                    width: 100%;
                    max-height: 150px;
                    object-fit: contain;
                }}

                h1 {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #004080;
                    margin-bottom: 2px;
                }}

                .report-date {{
                    font-size: 16px;
                    color: #666;
                    font-weight: normal;
                }}

                /* Content Container */
                .content-container {{
                    width: 95%;
                    margin: auto;
                    padding: 15px;
                    background: transparent;
                    border-radius: 8px;
                    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                    
                }}

                /* Table Styling */
                table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                    background: transparent;
                }}

                th, td {{
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: center;
                    font-size: 14px;
                    background: transparent;
                }}
                
                td img {{
                    width: 10px;
                    height:10px;
                    object-fit: contain;
                    display: block;
                    margin: auto;
                    border-radius: 4px;
                }}

                th {{
                    background: transparent;
                    color: black;
                    font-weight: bold;
                }}

                tr:nth-child(even) {{
                  background: transparent;
                }}

                tr:hover {{
                    background: transparent;
                }}

                /* Page Breaks */
                .page-break {{
                    page-break-before: always;
                }}

                /* Footer */
                .footer {{
                    text-align: center;
                    font-size: 12px;
                    margin-top: 30px;
                    padding-top: 10px;
                    border-top: 2px solid #999;
                    color: #666;
                    font-style: italic;
                }}
            </style>
        </head>
        <body>

            <!-- Watermark -->
            <img class="watermark" src="file://{watermark_path}" alt="Watermark">

            <!-- Header -->
            <div class="header">
                <img src="file://{image_path}" alt="Report Header">
                <h1>{report_title}</h1>
                <p class="report-date">{current_date}</p>
            </div>

            <!-- Content -->
            <div class="content-container">
                {html_content}
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>This report has been generated by an artificial intelligence-based automated system.</p>
            </div>

        </body>
        </html>
        """


    # Convert HTML to PDF
    HTML(string=full_html).write_pdf(output_pdf)
    print(f"✅ PDF generated successfully: {output_pdf}")

def generate_html_table_from_parsed_data(parsed_data):
        html_tables = []

        for section_title, rows in parsed_data:
            if not rows:
                continue

            headers = rows[0].keys()
            table_html = "<table><thead><tr>"

            # Table Headers
            for header in headers:
                table_html += f"<th>{header}</th>"
            table_html += "</tr></thead><tbody>"

            # Table Rows
            for row in rows:
                table_html += "<tr>"
                for cell in row.values():
                    table_html += f"<td>{cell}</td>"
                table_html += "</tr>"

            table_html += "</tbody></table>"

            # Add section title if any
            if section_title:
                html_tables.append(f"<h2>{section_title}</h2>{table_html}")
            else:
                html_tables.append(table_html)

        return "\n".join(html_tables)

def markdown_to_pdf_english_from_parsed_data(parsed_data, output_pdf="report_english.pdf", report_title="Report"):
        image_path = os.path.abspath("media/logo/header.JPG")
        watermark_path = os.path.abspath("media/logo/watermark1.jpg")
        current_date = datetime.today().strftime("%d %B %Y")

        html_content = generate_html_table_from_parsed_data(parsed_data)

        full_html = f"""
        <!DOCTYPE html>
        <html lang="en" dir="ltr">
        <head>
            <meta charset="UTF-8">
            <style>
                @page {{
                    size: A4;
                    margin: 20mm 15mm 25mm 15mm;
                }}

                body {{
                    font-family: Arial, sans-serif;
                    direction: ltr;
                    text-align: left;
                    margin: 0;
                    padding: 0;
                    background-color: #FFFFFF;
                    position: relative;
                }}

                .watermark {{
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.1;
                    width: 60%;
                    z-index: -1;
                }}

                .header {{
                    text-align: center;
                    padding-bottom: 10px;
                    border-bottom: 3px solid #004080;
                    margin-bottom: 15px;
                }}

                .header img {{
                    width: 100%;
                    max-height: 150px;
                    object-fit: contain;
                }}

                h1 {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #004080;
                    margin-bottom: 2px;
                }}

                .report-date {{
                    font-size: 16px;
                    color: #666;
                }}

                .content-container {{
                    width: 95%;
                    margin: auto;
                    padding: 15px;
                }}

                table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }}

                th, td {{
                    border: 1px solid #ddd;
                    padding: 10px;
                    font-size: 14px;
                    text-align: left;
                }}

                th {{
                    background-color: #f4f4f4;
                    font-weight: bold;
                }}

                .footer {{
                    text-align: center;
                    font-size: 12px;
                    margin-top: 30px;
                    padding-top: 10px;
                    border-top: 2px solid #999;
                    color: #666;
                    font-style: italic;
                }}
            </style>
        </head>
        <body>
            <img class="watermark" src="file://{watermark_path}" alt="Watermark">
            <div class="header">
                <img src="file://{image_path}" alt="Header">
                <h1>{report_title}</h1>
                <p class="report-date">{current_date}</p>
            </div>
            <div class="content-container">
                {html_content}
            </div>
            <div class="footer">
                <p>This report has been generated by an AI-based system.</p>
            </div>
        </body>
        </html>
        """

        HTML(string=full_html).write_pdf(output_pdf)
        print(f"✅ PDF generated successfully: {output_pdf}")
    
def parse_html_tables(html):
    parsed_data = []

    soup = BeautifulSoup(html, 'html.parser')
    tables = soup.find_all('table')

    for table in tables:
        headers = [th.get_text(strip=True) for th in table.find_all('th')]
        rows = []
        for tr in table.find_all('tr')[1:]:
            cells = [td.get_text(strip=True) for td in tr.find_all('td')]
            if len(cells) == len(headers):
                rows.append(dict(zip(headers, cells)))
        parsed_data.append(("", rows))  # No header section
    return parsed_data


def markdown_to_pdf_english(markdown_text, output_pdf="report_english.pdf", report_title="Report"):
    """
    Converts Markdown text to a professional-looking English PDF (LTR) with a watermark.
    """

    # Get absolute paths for images
    image_path = os.path.abspath("media/logo/header.JPG")
    watermark_path = os.path.abspath("media/logo/watermark1.jpg")
    print("title is ------pppppp34344------------->>>",report_title)
    # Get today's date in a readable format (e.g., 24 February 2025)
    current_date = datetime.today().strftime("%d %B %Y")

    # Convert Markdown to HTML with table support
    html_content = markdown.markdown(markdown_text, extensions=["tables"])

    # Full HTML structure with date added
    full_html = f"""
        <!DOCTYPE html>
        <html lang="en" dir="ltr">
        <head>
            <meta charset="UTF-8">
            <style>
                @page {{
                    size: A4;
                    margin: 20mm 15mm 25mm 15mm; /* Adjust margins */
                }}

                body {{
                    font-family: Arial, sans-serif;
                    direction: ltr;
                    text-align: left;
                    margin: 0;
                    padding: 0;
                    background-color: #FFFFFF;
                    position: relative;
                }}

                /* Watermark */
                .watermark {{
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.8;
                    width: 60%;
                    height: auto;
                    z-index: -1;
                }}

                /* Header */
                .header {{
                    text-align: center;
                    padding-bottom: 5px;
                    margin-bottom: 10px;
                    border-bottom: 2px solid #004080;
                }}

                .header img {{
                    max-width: 100%;
                    max-height: 120px;
                    object-fit: contain;
                    margin-bottom: 8px;
                }}

                h1 {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #004080;
                    margin-bottom: 2px;
                }}

                .report-date {{
                    font-size: 14px;
                    color: #555;
                    font-weight: normal;
                    margin: 0;
                }}

                /* Content Container */
                .content-container {{
                    width: 95%;
                    margin: auto;
                    padding: 15px;
                    background: transparent;
                    border-radius: 8px;
                    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                }}

                /* Table Styling */
                table {{
                    table-layout: fixed;
                    width: 100%;
                    border-collapse: collapse;

                }}

                th, td {{
                    border: 1px solid #ddd;
                    padding: 10px;
                    font-size: 13px;
                    word-wrap: break-word;
                    vertical-align: middle;
                    text-align: center;
                }}
                th:nth-child(2), td:nth-child(2) {{ /* Title column */
                    width: 25%;
                    text-align: left;
                    padding-left: 8px;
                }}

                td:nth-child(2) {{
                line-height: 1.4;
                font-size: 13px;
                white-space: normal;
                overflow-wrap: break-word;
            }}
                td img {{
                    width: 85px;
                    height: 55px;
                    object-fit: cover;
                    display: block;
                    margin: auto;
                    border-radius: 3px;
                    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1);
                }}
                th {{
                    background-color: #f0f0f0;
                    font-weight: bold;
                    color: #222;
                }}

                tr:nth-child(even) {{
                    background: transparent;
                }}

                tr:hover {{
                    background-color: #f9f9f9;
                }}

                /* Page Breaks */
                .page-break {{
                    page-break-before: always;
                }}

                /* Footer */
                .footer {{
                    text-align: center;
                    font-size: 12px;
                    margin-top: 30px;
                    padding-top: 10px;
                    border-top: 2px solid #999;
                    color: #666;
                    font-style: italic;
                }}
            </style>
        </head>
        <body>

            <!-- Watermark -->
            <img class="watermark" src="file://{watermark_path}" alt="Watermark">

            <!-- Header -->
            <div class="header">
                <img src="file://{image_path}" alt="Report Header">
                <h1>{report_title}</h1>
                <p class="report-date">{current_date}</p>
            </div>

            <!-- Content -->
            <div class="content-container">
                {html_content}
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>This report has been generated by an artificial intelligence-based automated system.</p>
            </div>

        </body>
        </html>
    """

    # Convert HTML to PDF
    HTML(string=full_html).write_pdf(output_pdf)
    print(f"✅ PD44444444444 generated successfully: {output_pdf}")

# def markdown_to_pdf_english(markdown_text, output_pdf="report_english.pdf", report_title="Report"):
#     """
#     Converts Markdown text to a professional-looking English PDF (LTR) with a watermark.
#     """

#     from bs4 import BeautifulSoup
#     from datetime import datetime

#     def format_date_string(iso_string):
#         try:
#             dt = datetime.fromisoformat(iso_string)
#             return dt.strftime("%d %B %Y, %I:%M %p")
#         except Exception:
#             return iso_string

#     image_path = os.path.abspath("media/logo/header.JPG")
#     watermark_path = os.path.abspath("media/logo/watermark1.jpg")
#     print("title is ------pppppp34344------------->>>", report_title)
#     current_date = datetime.today().strftime("%d %B %Y")

#     html_content = markdown.markdown(markdown_text, extensions=["tables"])
#     soup = BeautifulSoup(html_content, "html.parser")

#     for td in soup.find_all("td"):
#         text = td.get_text(strip=True)
#         if "T" in text and "+" in text:
#             td.string = format_date_string(text)

#     html_content = str(soup)

#     full_html = f"""
#         <!DOCTYPE html>
#         <html lang="en" dir="ltr">
#         <head>
#             <meta charset="UTF-8">
#             <style>
#                 @page {{
#                     size: A4;
#                     margin: 20mm 15mm 25mm 15mm;
#                 }}
#                 body {{
#                     font-family: Arial, sans-serif;
#                     direction: ltr;
#                     text-align: left;
#                     margin: 0;
#                     padding: 0;
#                     background-color: #FFFFFF;
#                     position: relative;
#                 }}
#                 .watermark {{
#                     position: fixed;
#                     top: 50%;
#                     left: 50%;
#                     transform: translate(-50%, -50%);
#                     opacity: 0.8;
#                     width: 60%;
#                     height: auto;
#                     z-index: -1;
#                 }}
#                 .header {{
#                     text-align: center;
#                     padding-bottom: 5px;
#                     margin-bottom: 10px;
#                     border-bottom: 2px solid #004080;
#                 }}
#                 .header img {{
#                     max-width: 100%;
#                     max-height: 120px;
#                     object-fit: contain;
#                     margin-bottom: 8px;
#                 }}
#                 h1 {{
#                     font-size: 28px;
#                     font-weight: bold;
#                     color: #004080;
#                     margin-bottom: 2px;
#                 }}
#                 .report-date {{
#                     font-size: 14px;
#                     color: #555;
#                     font-weight: normal;
#                     margin: 0;
#                 }}
#                 .content-container {{
#                     width: 95%;
#                     margin: auto;
#                     padding: 15px;
#                     background: transparent;
#                     border-radius: 8px;
#                     box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
#                 }}
#                 table {{
#                     table-layout: fixed;
#                     width: 100%;
#                     border-collapse: collapse;
#                 }}
#                 th, td {{
#                     border: 1px solid #ddd;
#                     padding: 10px;
#                     font-size: 13px;
#                     word-wrap: break-word;
#                     vertical-align: middle;
#                     text-align: center;
#                 }}
#                 th:nth-child(2), td:nth-child(2) {{
#                     width: 25%;
#                     text-align: left;
#                     padding-left: 8px;
#                 }}
#                 td:nth-child(2) {{
#                     line-height: 1.4;
#                     font-size: 13px;
#                     white-space: normal;
#                     overflow-wrap: break-word;
#                 }}
#                 td img {{
#                     width: 85px;
#                     height: 55px;
#                     object-fit: cover;
#                     display: block;
#                     margin: auto;
#                     border-radius: 3px;
#                     box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1);
#                 }}
#                 th {{
#                     background-color: #f0f0f0;
#                     font-weight: bold;
#                     color: #222;
#                 }}
#                 tr:nth-child(even) {{
#                     background: transparent;
#                 }}
#                 tr:hover {{
#                     background-color: #f9f9f9;
#                 }}
#                 .page-break {{
#                     page-break-before: always;
#                 }}
#                 .footer {{
#                     text-align: center;
#                     font-size: 12px;
#                     margin-top: 30px;
#                     padding-top: 10px;
#                     border-top: 2px solid #999;
#                     color: #666;
#                     font-style: italic;
#                 }}
#             </style>
#         </head>
#         <body>
#             <img class="watermark" src="file://{watermark_path}" alt="Watermark">
#             <div class="header">
#                 <img src="file://{image_path}" alt="Report Header">
#                 <h1>{report_title}</h1>
#                 <p class="report-date">{current_date}</p>
#             </div>
#             <div class="content-container">
#                 {html_content}
#             </div>
#             <div class="footer">
#                 <p>This report has been generated by an artificial intelligence-based automated system.</p>
#             </div>
#         </body>
#         </html>
#     """

#     HTML(string=full_html).write_pdf(output_pdf)
#     print(f"✅ PDF generated successfully: {output_pdf}")

def text_to_pdf(text, output_pdf="report.pdf", report_title="Report", language="en"):
    """
    Converts Urdu or English text into a properly formatted A4-size PDF with:
    - Bold headings
    - Proper text alignment (RTL for Urdu, LTR for English)
    - Header, watermark, and structured content
    """

    # Get absolute paths for images
    image_path = os.path.abspath("media/logo/header.JPG")
    watermark_path = os.path.abspath("media/logo/watermark1.jpg")

    # Get today's date
    current_date = datetime.today().strftime("%d %B %Y")

    # Detect language to set text direction and font
    is_urdu = language.lower() in ["ur", "urdu"]
    text_direction = "rtl" if is_urdu else "ltr"
    font_family = "'Jameel Noori Nastaleeq Regular', Arial, sans-serif" if is_urdu else "Arial, sans-serif"
    text_align = "right" if is_urdu else "left"

    # Convert plain text into HTML
    formatted_text = ""
    lines = text.split("\n")

    for line in lines:
        line = line.strip()

        # Remove "###" but keep the text bold
        if line.startswith("###"):
            line = re.sub(r"^###\s*(.*)", r"<p><strong>\1</strong></p>", line)
            formatted_text += line
            continue  # Skip further processing for this line

        # Keep words bold that start with **
        line = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", line)

        if line.startswith("•"):  # Bullet points
            formatted_text += f"<p style='margin-left:15px;'>{line}</p>"
        else:  # Regular text
            formatted_text += f"<p>{line}</p>"
    print("------------------------------------------")
    print("in the text to pdf", formatted_text)
    print("------------------------------------------")
    # Full HTML structure formatted for A4 size
    full_html = f""" 
    <!DOCTYPE html>
    <html lang="{language}" dir="{text_direction}">
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{
                size: A4;
                margin: 10mm 15mm 10mm 15mm; /* Reduced top margin */
            }}

            @font-face {{
                font-family: 'Jameel Noori Nastaleeq Regular';
                src: url('http://192.168.11.60:8001/static/fonts/JameelNooriNastaleeqKasheeda.ttf') format('truetype');
            }}

            body {{
                font-family: {font_family};
                direction: {text_direction};
                text-align: {text_align};
                margin: 0;
                padding: 0;
                width: 100%;  /* Exact A4 width */
                line-height: 1.6;
                font-size: 18px;
                border: none; /* Remove the red border */
                box-sizing: border-box; /* Ensures padding does not affect width */
                background-color: transparent;

            }}

            /* Watermark */
            .watermark-container {{
                position: fixed;
                top: 50%;
                left: 50%;
                width: 40%;
                height: 40%;
                background-image: url("file://{watermark_path}");
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                opacity: 0.7;
                z-index: -1;
                transform: translate(-50%, -50%);
            }}

            /* Header */
            .header {{
                text-align: center;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 3px solid #333;
                width: 100%; /* Ensures it spans the full content width */
                max-width: 100%; /* Keeps it slightly inside the page */
                margin-right: auto; /* Reduces right margin */
            }}

            .header img {{
                width: 100%; /* Ensure image fits within the header */
                max-height: 100px; /* Adjusted for better proportion */
                object-fit: contain;
            }}

            h1 {{
                font-size: 24px;
                font-weight: bold;
                color: #004080;
                margin-bottom: 3px;
            }}

            /* Date */
            .report-date {{
                font-size: 14px;
                color: #555;
                font-weight: normal;
                margin-top: 0;
            }}

            /* Content container */
            .content-container {{
                width: 95%;  /* Increased width to reduce left margin */
                margin: 2px auto 2px 5px;  /* Reduced left margin */
                padding: 2px;
                background: rgba(255, 255, 255, 0.1);
            }}

            /* Footer */
            .footer {{
                text-align: center;
                font-size: 10px;
                margin-top: 20px;
                padding-top: 5px;
                border-top: 1px solid #777;
                color: #555;
                font-style: italic;
                width: 100%;
            }}

            /* Bold Headings */
            strong {{
                font-size: 20px;
                color: #222;
                display: block;
                margin-bottom: 3px;
            }}
        </style>
    </head>
    <body>

        <!-- Watermark -->
        <div class="watermark-container"></div>

        <!-- Header -->
        <div class="header">
            <img src="file://{image_path}" alt="Report Header">
            <h1>{report_title}</h1>
            <p class="report-date">{current_date}</p>
        </div>

        <!-- Content -->
        <div class="content-container">
            {formatted_text.strip("**")}
        </div>

    </body>
    </html>
    """

    # Convert HTML to A4-sized PDF
    HTML(string=full_html).write_pdf(output_pdf)
    print(f"✅ PDFffff generated successfully: {output_pdf}")


