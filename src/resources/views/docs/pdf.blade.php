<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $spec['info']['title'] }} – v{{ $spec['info']['version'] }}</title>
    <style>
        @page  { margin: 70px 40px 60px 40px; }
        body   { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #1f2937; }
        h1     { font-size: 22px; margin: 0 0 4px; }
        h2     { font-size: 15px; margin: 24px 0 6px; padding-bottom: 3px; border-bottom: 1px solid #d1d5db; }
        h3     { font-size: 12px; margin: 14px 0 4px; color: #374151; }
        p      { margin: 4px 0 8px; }
        ul, ol { margin: 4px 0 8px; padding-left: 20px; }
        code   { font-family: 'DejaVu Sans Mono', monospace; background: #f3f4f6; padding: 1px 4px; border-radius: 2px; font-size: 10px; }
        table  { width: 100%; border-collapse: collapse; margin: 6px 0 12px; }
        th, td { padding: 4px 6px; border: 1px solid #e5e7eb; text-align: left; font-size: 10px; vertical-align: top; }
        th     { background: #f3f4f6; font-weight: bold; }
        .method      { display: inline-block; padding: 2px 7px; border-radius: 3px; color: #fff; font-weight: bold; font-size: 10px; text-transform: uppercase; margin-right: 6px; }
        .method.get  { background: #16a34a; }
        .method.post { background: #2563eb; }
        .endpoint    { font-family: 'DejaVu Sans Mono', monospace; font-size: 13px; }
        .desc        { color: #4b5563; }
        .small       { font-size: 9px; color: #6b7280; }
        .tag         { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 1px 6px; border-radius: 3px; font-size: 9px; margin-right: 4px; }
        header.cover { margin-bottom: 24px; }
        header.cover h1 { font-size: 26px; }
        header.cover .meta { font-size: 10px; color: #6b7280; margin-bottom: 12px; }
    </style>
</head>
<body>

<header class="cover">
    <h1>{{ $spec['info']['title'] }}</h1>
    <div class="meta">
        Version {{ $spec['info']['version'] }}
        &nbsp;·&nbsp;
        Generated {{ now()->format('Y-m-d H:i') }}
    </div>
    <p class="desc">{!! nl2br(e(trim($spec['info']['description']))) !!}</p>

    <h3>Servers</h3>
    <ul>
        @foreach ($spec['servers'] as $server)
            <li><code>{{ $server['url'] }}</code> — <span class="desc">{{ $server['description'] }}</span></li>
        @endforeach
    </ul>

    <h3>Authentication</h3>
    @php $auth = $spec['components']['securitySchemes']['apiKeyAuth'] ?? null; @endphp
    <p>
        Type: <code>{{ $auth['type'] ?? '' }}</code>
        in <code>{{ $auth['in'] ?? '' }}</code>
        named <code>{{ $auth['name'] ?? '' }}</code>.
    </p>
    @if (!empty($auth['description']))
        <p class="desc">{!! nl2br(e(trim($auth['description']))) !!}</p>
    @endif
</header>

@foreach ($spec['paths'] as $path => $methods)
    @foreach ($methods as $method => $op)
        <h2>
            <span class="method {{ $method }}">{{ $method }}</span>
            <span class="endpoint">{{ $path }}</span>
        </h2>

        @foreach ($op['tags'] ?? [] as $tag)
            <span class="tag">{{ $tag }}</span>
        @endforeach

        <p><strong>{{ $op['summary'] ?? '' }}</strong></p>

        @if (!empty($op['description']))
            <p class="desc">{!! nl2br(e(trim($op['description']))) !!}</p>
        @endif

        @php
            $bodyRef = data_get($op, 'requestBody.content.application/json.schema.$ref');
            $bodySchemaName = $bodyRef ? basename($bodyRef) : null;
            $bodySchema = $bodySchemaName ? ($spec['components']['schemas'][$bodySchemaName] ?? null) : null;
        @endphp

        @if ($bodySchema && !empty($bodySchema['properties']))
            <h3>Request body</h3>
            @if (!empty($bodySchema['description']))
                <p class="small">{{ trim($bodySchema['description']) }}</p>
            @endif
            <table>
                <thead>
                    <tr><th>Field</th><th>Type</th><th>Constraints</th><th>Description</th></tr>
                </thead>
                <tbody>
                    @foreach ($bodySchema['properties'] as $name => $prop)
                        <tr>
                            <td>
                                <code>{{ $name }}</code>
                                @if (in_array($name, $bodySchema['required'] ?? [], true))
                                    <span class="small" style="color:#dc2626"> *</span>
                                @endif
                            </td>
                            <td>{{ $prop['type'] ?? '' }}</td>
                            <td class="small">
                                @if (isset($prop['minimum'])) min {{ $prop['minimum'] }}<br>@endif
                                @if (isset($prop['maximum'])) max {{ $prop['maximum'] }}<br>@endif
                                @if (isset($prop['maxLength'])) maxLen {{ $prop['maxLength'] }}@endif
                            </td>
                            <td class="desc">{{ $prop['description'] ?? '' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

        <h3>Responses</h3>
        <table>
            <thead>
                <tr><th>Status</th><th>Description</th><th>Content type</th></tr>
            </thead>
            <tbody>
                @foreach ($op['responses'] as $status => $response)
                    <tr>
                        <td><code>{{ $status }}</code></td>
                        <td>{{ $response['description'] ?? '' }}</td>
                        <td class="small">
                            @foreach (($response['content'] ?? []) as $contentType => $body)
                                {{ $contentType }}<br>
                            @endforeach
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endforeach
@endforeach

<p class="small" style="margin-top: 24px;">
    Generated dynamically from <code>resources/api-docs/openapi.yaml</code>.
    Any change to that file is reflected in the next PDF render.
</p>

{{-- dompdf script hook: stamps "Page X / Y" in the footer of every page --}}
<script type="text/php">
    if (isset($pdf)) {
        $font  = $fontMetrics->getFont('DejaVu Sans', 'normal');
        $size  = 9;
        $title = "{{ addslashes($spec['info']['title']) }} v{{ $spec['info']['version'] }}";

        // top-left header
        $pdf->page_text(40, 30, $title, $font, $size, [0.45, 0.45, 0.45]);

        // bottom-right "Page X / Y"
        $text  = "Page {PAGE_NUM} / {PAGE_COUNT}";
        $width = $fontMetrics->getTextWidth($text, $font, $size);
        $x     = $pdf->get_width() - $width - 40;
        $y     = $pdf->get_height() - 30;
        $pdf->page_text($x, $y, $text, $font, $size, [0.45, 0.45, 0.45]);
    }
</script>

</body>
</html>
